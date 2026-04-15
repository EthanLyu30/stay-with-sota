import type { FetchedItem } from '../types';

export async function fetchArxiv(config?: Record<string, unknown>): Promise<FetchedItem[]> {
  const categories = (config?.categories as string[]) || ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG'];
  const items: FetchedItem[] = [];

  try {
    // 查询最近提交的论文
    const query = categories.map(cat => `cat:${cat}`).join(' OR ');
    const url = `http://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=30&start=0`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'SOTA-Bot/1.0' },
    });

    if (!res.ok) throw new Error(`ArXiv API returned ${res.status}`);

    const xml = await res.text();
    const entries = parseArxivXml(xml);

    // 过滤最近 48 小时的论文
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    for (const entry of entries) {
      const pubDate = new Date(entry.published);
      if (pubDate < twoDaysAgo) continue;

      items.push({
        sourceType: 'arxiv',
        sourceName: 'ArXiv',
        title: entry.title,
        description: entry.summary.substring(0, 500),
        url: entry.url,
        metadata: {
          authors: entry.authors,
          categories: entry.categories,
          published: entry.published,
        },
      });
    }
  } catch (err) {
    console.error('Failed to fetch ArXiv:', err);
  }

  return items;
}

interface ArxivEntry {
  title: string;
  summary: string;
  url: string;
  authors: string[];
  categories: string[];
  published: string;
}

function parseArxivXml(xml: string): ArxivEntry[] {
  const entries: ArxivEntry[] = [];

  // 简单的 XML 解析（避免引入额外依赖）
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const summaryMatch = block.match(/<summary>([\s\S]*?)<\/summary>/);
    const idMatch = block.match(/<id>(.*?)<\/id>/);

    // 提取作者
    const authors: string[] = [];
    const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(block)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    // 提取分类
    const categories: string[] = [];
    const catRegex = /<category\s+term="([^"]+)"/g;
    let catMatch;
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(catMatch[1]);
    }

    // 提取发布时间
    const publishedMatch = block.match(/<published>(.*?)<\/published>/);

    if (titleMatch && idMatch) {
      entries.push({
        title: titleMatch[1].replace(/\s+/g, ' ').trim(),
        summary: summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '',
        url: idMatch[1].trim(),
        authors,
        categories,
        published: publishedMatch ? publishedMatch[1].trim() : '',
      });
    }
  }

  return entries;
}
