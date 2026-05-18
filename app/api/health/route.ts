import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string }> = {};

  // Check Supabase
  try {
    const { error } = await supabase.from('sources').select('id', { count: 'exact', head: true });
    if (error) throw error;
    checks.database = { status: 'ok' };
  } catch (err) {
    checks.database = {
      status: 'error',
      message: err instanceof Error ? err.message : 'Database connection failed',
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
