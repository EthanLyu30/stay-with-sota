import { NextRequest, NextResponse } from 'next/server';
import { getDigests } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPage = parseInt(searchParams.get('page') || '1');
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 50);

    const result = await getDigests(page, pageSize);

    return NextResponse.json({
      success: true,
      data: result.items.map(d => ({
        id: d.id,
        date: d.date,
        title: d.title,
        totalFetched: d.totalFetched,
        totalFiltered: d.totalFiltered,
        emailSent: d.emailSent,
        createdAt: d.createdAt,
        preview: d.items.slice(0, 3).map(item => ({
          title: item.title,
          sourceType: item.sourceType,
          relevanceScore: item.relevanceScore,
        })),
      })),
      meta: { page, pageSize, total: result.total, hasMore: result.hasMore }
    });
  } catch (error) {
    console.error('Get digests error:', error);
    return NextResponse.json({ success: false, error: '操作失败' }, { status: 500 });
  }
}
