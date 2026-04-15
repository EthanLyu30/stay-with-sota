import type { FetchedItem } from '../types';

interface HFPaper {
  id: string;
  title: string;
  abstract: string;
  upvotes: number;
  paper_url: string;
  hub_url: string;
}

export async function fetchHuggingFace(_config?: Record<string, unknown>): Promise<FetchedItem[]> {
  const items: FetchedItem[] = [];

  try {
    const res = await fetch('https://huggingface.co/api/daily_papers', {
      headers: { 'User-Agent': 'SOTA-Bot/1.0' },
    });

    if (!res.ok) throw new Error(`HuggingFace API returned ${res.status}`);

    const papers = await res.json() as HFPaper[];

    for (const paper of papers.slice(0, 15)) {
      items.push({
        sourceType: 'huggingface',
        sourceName: 'HuggingFace',
        title: paper.title,
        description: paper.abstract?.substring(0, 500) || '',
        url: paper.paper_url,
        metadata: {
          upvotes: paper.upvotes,
          hubUrl: paper.hub_url,
          paperId: paper.id,
        },
      });
    }
  } catch (err) {
    console.error('Failed to fetch HuggingFace:', err);
  }

  return items;
}
