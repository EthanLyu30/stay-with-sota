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
    // 优先使用本地代理（解决国内网络问题），失败则直连
    let papers: HFPaper[] = [];
    let useProxy = false;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const proxyUrl = `${baseUrl}/api/proxy/huggingface?path=/api/daily_papers`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        papers = await res.json() as HFPaper[];
        useProxy = true;
      }
    } catch {
      console.log('[HF] Proxy failed, trying direct...');
    }

    // 代理失败，尝试直连
    if (papers.length === 0) {
      const res = await fetch('https://huggingface.co/api/daily_papers', {
        headers: { 'User-Agent': 'SOTA-Bot/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        papers = await res.json() as HFPaper[];
      }
    }

    console.log(`[HF] Fetched ${papers.length} papers (proxy: ${useProxy})`);

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
