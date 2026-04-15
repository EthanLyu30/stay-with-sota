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
import type { FetchedItem, Source } from '@/lib/types';

// Vercel Cron Job handler
export const maxDuration = 300; // 5 minutes for Pro plan

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

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 初始化默认数据源
    await initDefaultSources();

    // 获取启用的数据源
    const sources = await getSources();
    const enabledSources = sources.filter(s => s.enabled);

    if (enabledSources.length === 0) {
      return NextResponse.json({ message: 'No enabled sources', digest: null });
    }

    // 并行抓取所有数据源
    const fetchResults = await Promise.allSettled(
      enabledSources.map(source => fetchFromSource(source))
    );

    // 合并所有抓取结果
    const allItems: FetchedItem[] = [];
    for (const result of fetchResults) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({ message: 'No items fetched', digest: null });
    }

    // 跨源去重
    const dedupedItems = deduplicateItems(allItems);
    const dedupCount = allItems.length - dedupedItems.length;

    // AI 筛选和摘要
    const { digestItems, digestTitle } = await summarizeItems(dedupedItems);

    if (digestItems.length === 0) {
      return NextResponse.json({ message: 'No items passed filtering', digest: null });
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
    const emailSent = await sendDigestEmail(digest);
    if (emailSent) {
      digest.emailSent = true;
      await saveDigest(digest);
    }

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
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
