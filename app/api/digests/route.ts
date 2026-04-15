import { NextRequest, NextResponse } from 'next/server';
import { getDigests } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await getDigests(page, Math.min(pageSize, 50));

    return NextResponse.json({
      success: true,
      items: result.items.map(d => ({
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
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.error('Get digests error:', error);
    return NextResponse.json({ error: 'Failed to fetch digests' }, { status: 500 });
  }
}
