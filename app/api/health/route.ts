import { NextResponse } from 'next/server';
import { kv } from '@/lib/db';

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

  // Check Redis
  try {
    await kv.ping();
    checks.redis = { status: 'ok' };
  } catch (err) {
    checks.redis = {
      status: 'error',
      message: err instanceof Error ? err.message : 'Redis connection failed'
    };
  }

  const allOk = Object.values(checks).every(c => c.status === 'ok');

  return NextResponse.json({
    success: allOk,
    status: allOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks,
  }, { status: allOk ? 200 : 503 });
}
