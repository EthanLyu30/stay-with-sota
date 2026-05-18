import { supabase, getAdminClient } from './supabase';
import { logger } from './logger';
import type { Source, Digest, DigestItem, Stats } from './types';
import { getToday } from './utils';

const db = () => getAdminClient();

// ============ Sources CRUD ============

export async function getSources(): Promise<Source[]> {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    logger.error({ type: 'db_error', operation: 'getSources', error: error.message });
    return [];
  }

  return (data || []).map(mapSourceRow);
}

export async function addSource(source: Source): Promise<Source> {
  const row = toSourceRow(source);
  const { data, error } = await db()
    .from('sources')
    .insert(row)
    .select()
    .single();

  if (error) {
    logger.error({ type: 'db_error', operation: 'addSource', error: error.message });
    throw new Error(`Failed to add source: ${error.message}`);
  }

  return mapSourceRow(data);
}

export async function removeSource(id: string): Promise<boolean> {
  const { error } = await db()
    .from('sources')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error({ type: 'db_error', operation: 'removeSource', error: error.message });
    return false;
  }

  return true;
}

export async function updateSource(id: string, updates: Partial<Source>): Promise<Source | null> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.url !== undefined) row.url = updates.url;
  if (updates.enabled !== undefined) row.enabled = updates.enabled;
  if (updates.config !== undefined) row.config = updates.config;

  const { data, error } = await db()
    .from('sources')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error({ type: 'db_error', operation: 'updateSource', error: error.message });
    return null;
  }

  return data ? mapSourceRow(data) : null;
}

// ============ Digests CRUD ============

export async function saveDigest(digest: Digest): Promise<void> {
  logger.debug({ type: 'db_save_digest', digestId: digest.id, itemCount: digest.items.length });

  const digestRow = {
    id: digest.id,
    date: digest.date,
    title: digest.title,
    total_fetched: digest.totalFetched,
    total_filtered: digest.totalFiltered,
    email_sent: digest.emailSent,
    created_at: digest.createdAt,
  };

  const { error: digestError } = await db()
    .from('digests')
    .upsert(digestRow, { onConflict: 'id' });

  if (digestError) {
    logger.error({ type: 'db_error', operation: 'saveDigest', error: digestError.message });
    throw new Error(`Failed to save digest: ${digestError.message}`);
  }

  if (digest.items.length > 0) {
    const itemRows = digest.items.map((item, index) => ({
      id: item.id,
      digest_id: digest.id,
      source_type: item.sourceType,
      source_name: item.sourceName,
      title: item.title,
      summary: item.summary,
      url: item.url,
      relevance_score: item.relevanceScore,
      tags: item.tags,
      metadata: item.metadata || {},
      sort_order: index,
    }));

    const { error: itemsError } = await db()
      .from('digest_items')
      .upsert(itemRows, { onConflict: 'id' });

    if (itemsError) {
      logger.error({ type: 'db_error', operation: 'saveDigestItems', error: itemsError.message });
    }
  }

  logger.debug({ type: 'db_save_complete', digestId: digest.id });
}

export async function getDigest(id: string): Promise<Digest | null> {
  const { data, error } = await supabase
    .from('digests')
    .select('*, digest_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    if (error) logger.error({ type: 'db_error', operation: 'getDigest', error: error.message });
    return null;
  }

  return mapDigestRow(data);
}

export async function getDigestList(): Promise<string[]> {
  const { data, error } = await supabase
    .from('digests')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(365);

  if (error) {
    logger.error({ type: 'db_error', operation: 'getDigestList', error: error.message });
    return [];
  }

  return (data || []).map(row => row.id);
}

export async function getDigests(
  page: number = 1,
  pageSize: number = 10
): Promise<{ items: Digest[]; total: number; hasMore: boolean }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('digests')
    .select('*, digest_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    logger.error({ type: 'db_error', operation: 'getDigests', error: error.message });
    return { items: [], total: 0, hasMore: false };
  }

  const items = (data || []).map(mapDigestRow);
  const total = count || 0;

  return { items, total, hasMore: from + pageSize < total };
}

export async function getLatestDigest(): Promise<Digest | null> {
  const { data, error } = await supabase
    .from('digests')
    .select('*, digest_items(*)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return mapDigestRow(data);
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  const { data, error } = await supabase
    .from('digests')
    .select('*, digest_items(*)')
    .eq('date', date)
    .maybeSingle();

  if (error || !data) return null;

  return mapDigestRow(data);
}

// ============ Stats ============

export async function getStats(): Promise<Stats> {
  const [sourcesResult, digestCountResult, latestResult] = await Promise.all([
    supabase.from('sources').select('enabled', { count: 'exact' }).eq('enabled', true),
    supabase.from('digests').select('id', { count: 'exact', head: true }),
    getLatestDigest(),
  ]);

  return {
    totalDigests: digestCountResult.count || 0,
    todayItems: latestResult?.date === getToday() ? latestResult.items.length : 0,
    activeSources: sourcesResult.count || 0,
    lastEmailSent: latestResult?.emailSent ? latestResult.createdAt : null,
  };
}

// ============ Default Sources ============

export async function initDefaultSources(): Promise<void> {
  const { count } = await supabase
    .from('sources')
    .select('id', { count: 'exact', head: true });

  if (count && count > 0) return;

  const defaults: Source[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      type: 'github-trending',
      name: 'GitHub Trending',
      config: { languages: ['python', 'typescript', 'rust'], since: 'daily' },
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      type: 'arxiv',
      name: 'ArXiv AI Papers',
      config: { categories: ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG'] },
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      type: 'huggingface',
      name: 'HuggingFace Daily Papers',
      enabled: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      type: 'hackernews',
      name: 'Hacker News AI',
      config: { keywords: ['AI', 'LLM', 'GPT', 'LLaMA', 'transformer', 'machine learning', 'deep learning', 'neural'] },
      enabled: true,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const source of defaults) {
    try {
      await addSource(source);
    } catch (err) {
      logger.error({ type: 'db_init_default_source_error', sourceId: source.id });
    }
  }

  logger.info({ type: 'db_init_defaults', count: defaults.length });
}

// ============ Row Mappers ============

function mapSourceRow(row: Record<string, unknown>): Source {
  return {
    id: row.id as string,
    type: row.type as Source['type'],
    name: row.name as string,
    url: (row.url as string) || undefined,
    config: (row.config as Record<string, unknown>) || undefined,
    enabled: row.enabled as boolean,
    createdAt: row.created_at as string,
  };
}

function toSourceRow(source: Source): Record<string, unknown> {
  return {
    id: source.id,
    type: source.type,
    name: source.name,
    url: source.url || '',
    config: source.config || {},
    enabled: source.enabled,
    created_at: source.createdAt || new Date().toISOString(),
  };
}

function mapDigestRow(row: Record<string, unknown>): Digest {
  const items = ((row.digest_items as Array<Record<string, unknown>>) || [])
    .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
    .map(mapDigestItemRow);

  return {
    id: row.id as string,
    date: row.date as string,
    title: row.title as string,
    items,
    totalFetched: row.total_fetched as number,
    totalFiltered: row.total_filtered as number,
    emailSent: row.email_sent as boolean,
    createdAt: row.created_at as string,
  };
}

function mapDigestItemRow(row: Record<string, unknown>): DigestItem {
  return {
    id: row.id as string,
    sourceType: row.source_type as DigestItem['sourceType'],
    sourceName: row.source_name as string,
    title: row.title as string,
    summary: row.summary as string,
    url: row.url as string,
    relevanceScore: row.relevance_score as number,
    tags: (row.tags as string[]) || [],
    metadata: (row.metadata as Record<string, unknown>) || undefined,
  };
}
