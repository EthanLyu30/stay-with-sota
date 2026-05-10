import Parser from 'rss-parser';
import { logger } from '../logger';
import type { FetchedItem } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'SOTA-Bot/1.0' },
});

export async function fetchRSS(url: string, name?: string): Promise<FetchedItem[]> {
  const items: FetchedItem[] = [];

  try {
    const feed = await parser.parseURL(url);

    for (const entry of feed.items.slice(0, 20)) {
      items.push({
        sourceType: 'rss',
        sourceName: name || feed.title || 'RSS',
        title: entry.title || '',
        description: entry.contentSnippet || entry.content?.substring(0, 500) || '',
        url: entry.link || '',
        metadata: {
          author: entry.creator,
          pubDate: entry.pubDate,
          feedTitle: feed.title,
        },
      });
    }
  } catch (err) {
    logger.error({ type: 'fetch_error', source: 'rss', url, error: err instanceof Error ? err.message : String(err) });
  }

  return items;
}
