import { NextRequest, NextResponse } from 'next/server';
import { getSources, addSource, initDefaultSources } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { Source } from '@/lib/types';

export async function GET() {
  try {
    let sources = await getSources();
    if (sources.length === 0) {
      await initDefaultSources();
      sources = await getSources();
    }
    return NextResponse.json({ success: true, data: sources });
  } catch (error) {
    console.error('Get sources error:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, url, config } = body as Partial<Source>;

    if (!type || !name) {
      return NextResponse.json({ error: 'type and name are required' }, { status: 400 });
    }

    const source: Source = {
      id: generateId(),
      type,
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
    return NextResponse.json({ error: 'Failed to add source' }, { status: 500 });
  }
}
