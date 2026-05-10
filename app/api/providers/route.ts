import { NextResponse } from 'next/server';
import { BUILTIN_PROVIDERS } from '@/lib/ai/types';

export async function GET() {
  // 返回提供商列表（隐藏 apiKey）
  const providers = BUILTIN_PROVIDERS.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    model: p.model,
    description: p.description,
    batchSize: p.batchSize,
    configured: !!p.apiKey || p.type === 'ollama',
  }));

  const activeProvider = process.env.LLM_PROVIDER || 'ollama-gemma4';

  const response = NextResponse.json({
    success: true,
    data: { providers, activeProvider }
  });

  // 缓存 5 分钟
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  return response;
}
