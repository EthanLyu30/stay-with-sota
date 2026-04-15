import { NextRequest, NextResponse } from 'next/server';
import { getDigest } from '@/lib/db';

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

    return NextResponse.json({ success: true, data: digest });
  } catch (error) {
    console.error('Get digest error:', error);
    return NextResponse.json({ error: 'Failed to fetch digest' }, { status: 500 });
  }
}
