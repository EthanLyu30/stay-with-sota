import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});
import type { Source, Digest, Stats } from './types';
import { getToday, safeJsonParse } from './utils';

// Key 命名规范
const KEYS = {
  SOURCES: 'sota:sources',
  DIGEST: (id: string) => `sota:digest:${id}`,
  DIGEST_LIST: 'sota:digest-list',
  DIGEST_BY_DATE: (date: string) => `sota:digest-date:${date}`,
  STATS: 'sota:stats',
  LAST_DIGEST: 'sota:last-digest',
} as const;

// ============ Sources CRUD ============

export async function getSources(): Promise<Source[]> {
  const data = await kv.get<string>(KEYS.SOURCES);
  return safeJsonParse<Source[]>(data || '[]', []);
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
  // 保存简报详情
  await kv.set(KEYS.DIGEST(digest.id), JSON.stringify(digest), { ex: 90 * 24 * 3600 }); // 90天过期

  // 更新列表（最新在前）
  const list = await getDigestList();
  list.unshift(digest.id);
  // 最多保留 365 条
  if (list.length > 365) list.length = 365;
  await kv.set(KEYS.DIGEST_LIST, JSON.stringify(list));

  // 按日期索引
  await kv.set(KEYS.DIGEST_BY_DATE(digest.date), digest.id, { ex: 90 * 24 * 3600 });

  // 更新最后简报
  await kv.set(KEYS.LAST_DIGEST, digest.id);
}

export async function getDigest(id: string): Promise<Digest | null> {
  const data = await kv.get<string>(KEYS.DIGEST(id));
  return safeJsonParse<Digest | null>(data || 'null', null);
}

export async function getDigestList(): Promise<string[]> {
  const data = await kv.get<string>(KEYS.DIGEST_LIST);
  return safeJsonParse<string[]>(data || '[]', []);
}

export async function getDigests(page: number = 1, pageSize: number = 10): Promise<{ items: Digest[]; total: number; hasMore: boolean }> {
  const list = await getDigestList();
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageIds = list.slice(start, end);

  const items = await Promise.all(
    pageIds.map(id => getDigest(id))
  );

  return {
    items: items.filter((d): d is Digest => d !== null),
    total,
    hasMore: end < total,
  };
}

export async function getLatestDigest(): Promise<Digest | null> {
  const lastId = await kv.get<string>(KEYS.LAST_DIGEST);
  if (!lastId) return null;
  return getDigest(lastId);
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const id = await kv.get<string>(KEYS.DIGEST_BY_DATE(date));
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
}
