import type { FetchedItem } from '../types';

export async function fetchGitHubReleases(config?: Record<string, unknown>): Promise<FetchedItem[]> {
  const repos = (config?.repos as string[]) || [
    'langgenius/dify',
    'ollama/ollama',
    'vercel/next.js',
    'openai/whisper',
    'anthropics/anthropic-cookbook',
  ];

  const token = process.env.GITHUB_TOKEN;
  const items: FetchedItem[] = [];

  for (const repo of repos) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SOTA-Bot/1.0',
      };
      if (token) headers['Authorization'] = `token ${token}`;

      const res = await fetch(
        `https://api.github.com/repos/${repo}/releases?per_page=3`,
        { headers }
      );

      if (!res.ok) continue;

      const releases = await res.json() as Array<{
        tag_name: string;
        name: string;
        body: string;
        html_url: string;
        published_at: string;
      }>;

      for (const release of releases) {
        // 只取最近 48 小时的 release
        const releaseDate = new Date(release.published_at);
        const hoursDiff = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 48) continue;

        items.push({
          sourceType: 'github-release',
          sourceName: 'GitHub Release',
          title: `${repo.split('/')[1]} ${release.tag_name}`,
          description: release.body?.substring(0, 300) || release.name || release.tag_name,
          url: release.html_url,
          metadata: {
            repo,
            tag: release.tag_name,
            publishedAt: release.published_at,
          },
        });
      }
    } catch (err) {
      console.error(`Failed to fetch releases for ${repo}:`, err);
    }
  }

  return items;
}
