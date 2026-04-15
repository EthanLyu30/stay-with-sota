import { NextRequest, NextResponse } from 'next/server';
import { getDigest } from '@/lib/db';
import { SOURCE_META } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const digest = await getDigest(id);

    if (!digest) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }

    const markdown = generateMarkdown(digest);

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="sota-daily-${digest.date}.md"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: '导出失败' }, { status: 500 });
  }
}

function generateMarkdown(digest: any): string {
  const date = new Date(digest.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const passRate = Math.round(
    (digest.totalFiltered / Math.max(digest.totalFetched, 1)) * 100
  );

  let md = `# ${digest.title}\n\n`;
  md += `> ${date} | 抓取 ${digest.totalFetched} 条 | 精选 ${digest.totalFiltered} 条 | 通过率 ${passRate}%\n\n`;
  md += `---\n\n`;

  // 按数据源分组
  const grouped = new Map<string, typeof digest.items[]>();
  for (const item of digest.items) {
    const key = item.sourceType;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  for (const [sourceType, items] of grouped) {
    const meta = SOURCE_META[sourceType] || { icon: '📡', label: sourceType };
    md += `## ${meta.icon} ${meta.label} (${items.length} 条)\n\n`;

    for (const item of items) {
      md += `### [${item.title}](${item.url})\n\n`;
      md += `**评分:** ${item.relevanceScore}/100 | ${item.summary}\n\n`;
      if (item.tags.length > 0) {
        md += `**标签:** ${item.tags.map((t: string) => `\`${t}\``).join(' ')}\n\n`;
      }
      md += `---\n\n`;
    }
  }

  md += `\n*由 SOTA Daily 自动生成*\n`;

  return md;
}
