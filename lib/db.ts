import { Redis } from '@upstash/redis';
import type { Source, Digest, Stats } from './types';
import { getToday } from './utils';

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Key 命名规范
const KEYS = {
  SOURCES: 'sota:sources',
  DIGEST: (id: string) => `sota:digest:${id}`,
  DIGEST_LIST: 'sota:digest-list',
  DIGEST_BY_DATE: (date: string) => `sota:digest-date:${date}`,
  STATS: 'sota:stats',
  LAST_DIGEST: 'sota:last-digest',
} as const;

// ============ Helpers ============

/**
 * 安全获取 JSON 数据
 * @upstash/redis 会自动反序列化 JSON，但也可能返回字符串
 */
async function kvGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const data = await kv.get(key);
    if (data === null || data === undefined) return fallback;
    // @upstash/redis 可能返回已解析的对象，也可能是字符串
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return fallback;
      }
    }
    return data as T;
  } catch {
    return fallback;
  }
}

// ============ Sources CRUD ============

export async function getSources(): Promise<Source[]> {
  return kvGet<Source[]>(KEYS.SOURCES, []);
}

export async function addSource(source: Source): Promise<Source> {
  const sources = await getSources();
  sources.push(source);
  await kv.set(KEYS.SOURCES, JSON.stringify(sources));
  return source;
}

export async function removeSource(id: string): Promise<boolean> {
  const sources = await getSources();
  const filtered = sources.filter(s => s.id !== id);
  if (filtered.length === sources.length) return false;
  await kv.set(KEYS.SOURCES, JSON.stringify(filtered));
  return true;
}

export async function updateSource(id: string, updates: Partial<Source>): Promise<Source | null> {
  const sources = await getSources();
  const index = sources.findIndex(s => s.id === id);
  if (index === -1) return null;
  sources[index] = { ...sources[index], ...updates };
  await kv.set(KEYS.SOURCES, JSON.stringify(sources));
  return sources[index];
}

// ============ Digests CRUD ============

export async function saveDigest(digest: Digest): Promise<void> {
  console.log(`[DB] Saving digest ${digest.id} with ${digest.items.length} items`);
  
  // 保存简报详情
  await kv.set(KEYS.DIGEST(digest.id), JSON.stringify(digest), { ex: 90 * 24 * 3600 });

  // 更新列表（最新在前）
  const list = await getDigestList();
  list.unshift(digest.id);
  if (list.length > 365) list.length = 365;
  await kv.set(KEYS.DIGEST_LIST, JSON.stringify(list));
  console.log(`[DB] Digest list now has ${list.length} items`);

  // 按日期索引
  await kv.set(KEYS.DIGEST_BY_DATE(digest.date), digest.id, { ex: 90 * 24 * 3600 });

  // 更新最后简报
  await kv.set(KEYS.LAST_DIGEST, digest.id);
  console.log(`[DB] Digest saved successfully`);
}

export async function getDigest(id: string): Promise<Digest | null> {
  return kvGet<Digest | null>(KEYS.DIGEST(id), null);
}

export async function getDigestList(): Promise<string[]> {
  return kvGet<string[]>(KEYS.DIGEST_LIST, []);
}

export async function getDigests(page: number = 1, pageSize: number = 10): Promise<{ items: Digest[]; total: number; hasMore: boolean }> {
  const list = await getDigestList();
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageIds = list.slice(start, end);

  console.log(`[DB] getDigests: list has ${list.length} IDs, fetching page ${page}`);

  const items = await Promise.all(
    pageIds.map(async id => {
      const d = await getDigest(id);
      if (!d) console.log(`[DB] Warning: digest ${id} not found`);
      return d;
    })
  );

  const validItems = items.filter((d): d is Digest => d !== null);
  console.log(`[DB] getDigests: returning ${validItems.length} valid items`);

  return {
    items: validItems,
    total,
    hasMore: end < total,
  };
}

export async function getLatestDigest(): Promise<Digest | null> {
  const lastId = await kvGet<string>(KEYS.LAST_DIGEST, '');
  if (!lastId) return null;
  return getDigest(lastId);
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const id = await kvGet<string>(KEYS.DIGEST_BY_DATE(date), '');
  if (!id) return null;
  return getDigest(id);
}

// ============ Stats ============

export async function getStats(): Promise<Stats> {
  const sources = await getSources();
  const list = await getDigestList();
  const latest = await getLatestDigest();

  return {
    totalDigests: list.length,
    todayItems: latest?.date === getToday() ? latest.items.length : 0,
    activeSources: sources.filter(s => s.enabled).length,
    lastEmailSent: latest?.emailSent ? latest.createdAt : null,
  };
}

// ============ Default Sources ============

export async function initDefaultSources(): Promise<void> {
  const existing = await getSources();
  if (existing.length > 0) return;

  const defaults: Source[] = [
    {
      id: 'default-github-trending',
      type: 'github-trending',
      name: 'GitHub Trending',
      config: { languages: ['python', 'typescript', 'rust'], since: 'daily' },
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-arxiv',
      type: 'arxiv',
      name: 'ArXiv AI Papers',
      config: { categories: ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG'] },
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-huggingface',
      type: 'huggingface',
      name: 'HuggingFace Daily Papers',
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-hackernews',
      type: 'hackernews',
      name: 'Hacker News AI',
      config: { keywords: ['AI', 'LLM', 'GPT', 'LLaMA', 'transformer', 'machine learning', 'deep learning', 'neural'] },
      enabled: true,
      createdAt: new Date().toISOString(),
    },
  ];

  await kv.set(KEYS.SOURCES, JSON.stringify(defaults));
  console.log('[DB] Default sources initialized');
}
