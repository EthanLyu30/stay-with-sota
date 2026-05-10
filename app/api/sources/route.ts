import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource, initDefaultSources } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Source, SourceType } from '@/lib/types';

const VALID_SOURCE_TYPES: SourceType[] = [
  'github-trending',
  'github-release',
  'arxiv',
  'huggingface',
  'hackernews',
  'rss',
];

export async function GET() {
  try {
    let sources = await getSources();
    if (sources.length === 0) {
      await initDefaultSources();
      sources = await getSources();
    }
    const response = NextResponse.json({ success: true, data: sources });

    // 缓存 30 秒
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Get sources error:', error);
    return NextResponse.json({ success: false, error: '操作失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, url, config } = body as Partial<Source>;

    if (!type || !name) {
      return NextResponse.json({ success: false, error: 'type and name are required' }, { status: 400 });
    }

    // 验证数据源类型
    if (!VALID_SOURCE_TYPES.includes(type as SourceType)) {
      return NextResponse.json({ success: false, error: '无效的数据源类型' }, { status: 400 });
    }

    const source: Source = {
      id: generateId(),
      type: type as SourceType,
      name,
      url,
      config: config || {},
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    await addSource(source);
    return NextResponse.json({ success: true, data: source }, { status: 201 });
  } catch (error) {
    console.error('Add source error:', error);
    return NextResponse.json({ success: false, error: '操作失败' }, { status: 500 });
  }
}
