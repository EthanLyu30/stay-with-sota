import type { FetchedItem } from '../types';

interface TrendingRepo {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: string;
  todayStars: string;
}

export async function fetchGitHubTrending(config?: Record<string, unknown>): Promise<FetchedItem[]> {
  const languages = (config?.languages as string[]) || ['python', 'typescript', 'rust'];
  const since = (config?.since as string) || 'daily';
  const items: FetchedItem[] = [];

  for (const lang of languages) {
    try {
      const url = `https://github.com/trending/${lang}?since=${since}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SOTA-Bot/1.0)',
          'Accept': 'text/html',
        },
      });

      if (!res.ok) continue;

      const html = await res.text();
      const repos = parseTrendingHtml(html);

      for (const repo of repos) {
        items.push({
          sourceType: 'github-trending',
          sourceName: 'GitHub Trending',
          title: `${repo.name} (${repo.language})`,
          description: `${repo.description} ⭐ ${repo.stars} | 今日 +${repo.todayStars}`,
          url: repo.url,
          metadata: {
            language: repo.language,
            stars: repo.stars,
            todayStars: repo.todayStars,
          },
        });
      }
    } catch (err) {
      console.error(`Failed to fetch GitHub Trending for ${lang}:`, err);
    }
  }

  return items;
}

function parseTrendingHtml(html: string): TrendingRepo[] {
  const repos: TrendingRepo[] = [];

  // 解析 GitHub Trending 页面 HTML
  // 每个仓库条目在 <article class="Box-row"> 中
  const articleRegex = /<article class="Box-row">([\s\S]*?)<\/article>/g;
  let match;

  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1];

    // 仓库名
    const nameMatch = block.match(/<h2[^>]*>[\s\S]*?href="\/([^"]+)"[\s\S]*?<\/h2>/);
    const name = nameMatch ? nameMatch[1].replace(/^\s+|\s+$/g, '') : '';

    // 描述
    const descMatch = block.match(/<p class="col-9[^"]*">([\s\S]*?)<\/p>/);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // 语言
    const langMatch = block.match(/itemprop="programmingLanguage">([^<]+)<\/span>/);
    const language = langMatch ? langMatch[1].trim() : '';

    // 总星标
    const starsMatch = block.match(/href="\/[^"]+\/stargazers"[^>]*>\s*([\d,]+)/);
    const stars = starsMatch ? starsMatch[1] : '0';

    // 今日新增星标
    const todayMatch = block.match(/(\d[\d,]*)\s*stars today/);
    const todayStars = todayMatch ? todayMatch[1] : '0';

    if (name) {
      repos.push({
        name,
        url: `https://github.com/${name}`,
        description,
        language,
        stars,
        todayStars,
      });
    }
  }

  return repos;
}
