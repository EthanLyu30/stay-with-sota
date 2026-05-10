import { NextRequest, NextResponse } from 'next/server';
import { getSources, saveDigest, initDefaultSources } from '@/lib/db';
import { fetchGitHubTrending } from '@/lib/fetchers/github-trending';
import { fetchGitHubReleases } from '@/lib/fetchers/github-releases';
import { fetchArxiv } from '@/lib/fetchers/arxiv';
import { fetchHuggingFace } from '@/lib/fetchers/huggingface';
import { fetchHackerNews } from '@/lib/fetchers/hackernews';
import { fetchRSS } from '@/lib/fetchers/rss';
import { summarizeItems } from '@/lib/ai/summarizer';
import { sendDigestEmail } from '@/lib/email/sender';
import { deduplicateItems } from '@/lib/dedup';
import { generateId, getToday } from '@/lib/utils';
import { logger, logCronJob } from '@/lib/logger';
import type { FetchedItem, Source } from '@/lib/types';

// Vercel Cron Job handler
export const maxDuration = 300;

async function fetchFromSource(source: Source): Promise<FetchedItem[]> {
  switch (source.type) {
    case 'github-trending':
      return fetchGitHubTrending(source.config);
    case 'github-release':
      return fetchGitHubReleases(source.config);
    case 'arxiv':
      return fetchArxiv(source.config);
    case 'huggingface':
      return fetchHuggingFace(source.config);
    case 'hackernews':
      return fetchHackerNews(source.config);
    case 'rss':
      if (source.url) return fetchRSS(source.url, source.name);
      return [];
    default:
      return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证 Cron Secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
    } else {
      logger.warn({ type: 'security', message: 'CRON_SECRET is not set, cron endpoint is unprotected' }, 'Security warning');
    }

    // 初始化默认数据源
    await initDefaultSources();

    // 获取启用的数据源（如果 Redis 读取失败，使用内置兜底）
    let sources = await getSources();
    let enabledSources = sources.filter(s => s.enabled);

    // 兜底：如果 Redis 没有数据源，直接用内置默认值
    if (enabledSources.length === 0) {
      logger.info({ type: 'cron_fallback', message: 'No sources in Redis, using built-in defaults' });
      enabledSources = [
        { id: 'builtin-1', type: 'github-trending', name: 'GitHub Trending', config: { languages: ['python', 'typescript', 'rust'], since: 'daily' }, enabled: true, createdAt: '' },
        { id: 'builtin-2', type: 'arxiv', name: 'ArXiv AI Papers', config: { categories: ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG'] }, enabled: true, createdAt: '' },
        { id: 'builtin-3', type: 'huggingface', name: 'HuggingFace Daily Papers', config: {}, enabled: true, createdAt: '' },
        { id: 'builtin-4', type: 'hackernews', name: 'Hacker News AI', config: { keywords: ['AI', 'LLM', 'GPT', 'LLaMA', 'transformer', 'machine learning', 'deep learning', 'neural'] }, enabled: true, createdAt: '' },
      ];
    }

    // 并行抓取所有数据源
    logCronJob('started', { sourceCount: enabledSources.length });
    const fetchResults = await Promise.allSettled(
      enabledSources.map(async (source) => {
        try {
          const items = await fetchFromSource(source);
          logger.info({ type: 'fetch_result', source: source.name, itemCount: items.length });
          return items;
        } catch (err) {
          logger.error({ type: 'fetch_error', source: source.name, error: err instanceof Error ? err.message : String(err) });
          return [];
        }
      })
    );

    // 合并所有抓取结果
    const allItems: FetchedItem[] = [];
    for (const result of fetchResults) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }

    logger.info({ type: 'fetch_total', totalItems: allItems.length });

    if (allItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: '所有数据源抓取结果为空。可能原因：网络问题、GitHub/HuggingFace 访问受限、或数据源配置有误。请检查终端日志。'
      });
    }

    // 跨源去重
    const dedupedItems = deduplicateItems(allItems);
    const dedupCount = allItems.length - dedupedItems.length;
    logger.info({ type: 'dedup_result', afterDedup: dedupedItems.length, removed: dedupCount });

    // AI 筛选和摘要
    logger.info({ type: 'ai_summarize_start', itemCount: dedupedItems.length });
    const { digestItems, digestTitle } = await summarizeItems(dedupedItems);
    logger.info({ type: 'ai_summarize_complete', filteredCount: digestItems.length });

    if (digestItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'AI 筛选后没有内容通过。可能原因：本地 Ollama 模型未运行、模型未拉取、或 API 调用失败。请检查终端日志。'
      });
    }

    // 创建简报
    const digest = {
      id: generateId(),
      date: getToday(),
      title: digestTitle,
      items: digestItems,
      totalFetched: allItems.length,
      totalFiltered: digestItems.length,
      emailSent: false,
      createdAt: new Date().toISOString(),
    };

    // 保存简报
    await saveDigest(digest);

    // 发送邮件
    let emailSent = false;
    try {
      emailSent = await sendDigestEmail(digest);
      if (emailSent) {
        digest.emailSent = true;
        await saveDigest(digest);
      }
    } catch (err) {
      logger.error({ type: 'email_error', error: err instanceof Error ? err.message : String(err) });
    }

    logCronJob('completed', { itemCount: digestItems.length, emailSent });

    return NextResponse.json({
      success: true,
      message: `Digest created with ${digestItems.length} items (deduped ${dedupCount} duplicates)`,
      digest: {
        id: digest.id,
        title: digest.title,
        totalFetched: digest.totalFetched,
        totalFiltered: digest.totalFiltered,
        deduped: dedupCount,
        emailSent: digest.emailSent,
      },
    });
  } catch (error) {
    logCronJob('failed', { error: error instanceof Error ? error.message : String(error) });
    logger.error({ type: 'cron_fatal', error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    );
  }
}
