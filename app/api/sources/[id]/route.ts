import { NextRequest, NextResponse } from 'next/server';
import { removeSource, updateSource } from '@/lib/db';

// PATCH 允许更新的字段白名单
const ALLOWED_PATCH_FIELDS = new Set(['enabled', 'name', 'url', 'config']);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证 id 参数
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json({ error: '无效的参数' }, { status: 400 });
    }

    const deleted = await removeSource(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete source error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证 id 参数
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json({ error: '无效的参数' }, { status: 400 });
    }

    const body = await request.json();

    // 仅允许更新白名单中的字段
    const filteredBody: Record<string, unknown> = {};
    for (const key of Object.keys(body)) {
      if (ALLOWED_PATCH_FIELDS.has(key)) {
        filteredBody[key] = body[key];
      }
    }

    const updated = await updateSource(id, filteredBody);

    if (!updated) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update source error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
