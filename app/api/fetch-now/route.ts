import { NextResponse } from 'next/server';
import { GET as cronGet } from '../cron/route';
import type { NextRequest } from 'next/server';

// 本地开发时给更长的超时时间
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  // 复用 cron 逻辑，但跳过 secret 验证（手动触发）
  const mockRequest = new Request(new URL('/api/cron', request.url), {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET || ''}` },
  });

  return cronGet(mockRequest as any);
}
