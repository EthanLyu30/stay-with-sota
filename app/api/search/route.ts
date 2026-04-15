import { NextRequest, NextResponse } from 'next/server';
import { getDigests } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!query) {
      return NextResponse.json({ success: false, error: '搜索关键词不能为空' }, { status: 400 });
    }

    // 获取所有简报（最多搜索最近 100 条）
    const allDigests = await getDigests(1, 100);
    const results: Array<{
      digestId: string;
      digestTitle: string;
      digestDate: string;
      itemId: string;
      title: string;
      summary: string;
      url: string;
      sourceType: string;
      relevanceScore: number;
      tags: string[];
    }> = [];

    for (const digest of allDigests.items) {
      for (const item of digest.items) {
        const searchText = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase();
        if (searchText.includes(query)) {
          results.push({
            digestId: digest.id,
            digestTitle: digest.title,
            digestDate: digest.date,
            itemId: item.id,
            title: item.title,
            summary: item.summary,
            url: item.url,
            sourceType: item.sourceType,
            relevanceScore: item.relevanceScore,
            tags: item.tags,
          });
        }
      }
    }

    // 按相关性分数排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageResults = results.slice(start, end);

    return NextResponse.json({
      success: true,
      items: pageResults,
      total,
      hasMore: end < total,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
