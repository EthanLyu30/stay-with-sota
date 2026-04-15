import type { FetchedItem } from '../types';

interface HNItem {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
}

export async function fetchHackerNews(config?: Record<string, unknown>): Promise<FetchedItem[]> {
  const keywords = (config?.keywords as string[]) || [
    'AI', 'LLM', 'GPT', 'LLaMA', 'transformer',
    'machine learning', 'deep learning', 'neural',
    'openai', 'anthropic', 'diffusion', 'RAG',
  ];

  const items: FetchedItem[] = [];

  try {
    // 获取 Top Stories
    const topRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
      { headers: { 'User-Agent': 'SOTA-Bot/1.0' } }
    );

    if (!topRes.ok) throw new Error('HN API failed');

    const topIds = await topRes.json() as number[];
    // 取前 100 条
    const candidateIds = topIds.slice(0, 100);

    // 并行获取详情
    const details = await Promise.allSettled(
      candidateIds.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.json() as Promise<HNItem>)
      )
    );

    for (const result of details) {
      if (result.status !== 'fulfilled') continue;
      const item = result.value;
      if (!item || !item.title) continue;

      // 关键词过滤
      const titleLower = item.title.toLowerCase();
      const matched = keywords.some(kw => titleLower.includes(kw.toLowerCase()));
      if (!matched) continue;

      items.push({
        sourceType: 'hackernews',
        sourceName: 'Hacker News',
        title: item.title,
        description: `Score: ${item.score} | Comments: ${item.descendants} | by ${item.by}`,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        metadata: {
          hnId: item.id,
          score: item.score,
          comments: item.descendants,
          by: item.by,
        },
      });
    }
  } catch (err) {
    console.error('Failed to fetch Hacker News:', err);
  }

  return items;
}
