import type { FetchedItem } from './types';

interface DuplicateCheckItem {
  url: string;
  title: string;
  description: string;
}

/**
 * 对抓取内容进行跨源去重
 * 基于标题相似度和 URL 匹配
 */
export function deduplicateItems(items: FetchedItem[]): FetchedItem[] {
  const seen = new Map<string, FetchedItem>();
  const deduped: FetchedItem[] = [];

  for (const item of items) {
    // 1. URL 精确匹配
    const urlKey = normalizeUrl(item.url);
    if (seen.has(urlKey)) {
      // 合并来源信息
      const existing = seen.get(urlKey)!;
      existing.sourceName = mergeSourceNames(existing.sourceName, item.sourceName);
      continue;
    }

    // 2. 标题相似度匹配（简单 Jaccard 相似度）
    let isDup = false;
    for (const [key, existing] of seen.entries()) {
      if (isTitleSimilar(item.title, existing.title)) {
        // 保留描述更长的那个
        if (item.description.length > existing.description.length) {
          existing.title = item.title;
          existing.description = item.description;
          existing.sourceName = mergeSourceNames(existing.sourceName, item.sourceName);
        } else {
          existing.sourceName = mergeSourceNames(existing.sourceName, item.sourceName);
        }
        isDup = true;
        break;
      }
    }

    if (!isDup) {
      seen.set(urlKey, item);
      deduped.push(item);
    }
  }

  return deduped;
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // 移除 trailing slash、query params、fragment
    return `${u.hostname}${u.pathname}`.replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

export function jaccardSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  // 标准化字符串
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
      .trim();

  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;

  // Jaccard 相似度（基于字符 bigram）
  const bigrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.substring(i, i + 2));
    }
    return set;
  };

  const ba = bigrams(na);
  const bb = bigrams(nb);

  let intersection = 0;
  for (const bg of ba) {
    if (bb.has(bg)) intersection++;
  }

  const union = ba.size + bb.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function isDuplicate(item: DuplicateCheckItem, existing: DuplicateCheckItem[]): boolean {
  // 1. URL 精确匹配
  const normalizedUrl = normalizeUrl(item.url);
  for (const ex of existing) {
    if (normalizeUrl(ex.url) === normalizedUrl) {
      return true;
    }
  }

  // 2. 标题相似度匹配
  for (const ex of existing) {
    const titleSim = jaccardSimilarity(item.title, ex.title);
    const descSim = jaccardSimilarity(item.description, ex.description);
    // 如果标题或描述相似度超过阈值，认为是重复
    if (titleSim > 0.7 || descSim > 0.7) {
      return true;
    }
  }

  return false;
}

function mergeSourceNames(a: string, b: string): string {
  if (a.includes(b) || b.includes(a)) return a;
  return `${a} / ${b}`;
}

function isTitleSimilar(a: string, b: string): boolean {
  // 标准化标题
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
      .trim();

  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return true;
  if (na.length < 10 || nb.length < 10) return false;

  // Jaccard 相似度（基于字符 bigram）
  const bigrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.substring(i, i + 2));
    }
    return set;
  };

  const ba = bigrams(na);
  const bb = bigrams(nb);

  let intersection = 0;
  for (const bg of ba) {
    if (bb.has(bg)) intersection++;
  }

  const union = ba.size + bb.size - intersection;
  const similarity = union > 0 ? intersection / union : 0;

  return similarity > 0.7; // 70% 相似度阈值
}
