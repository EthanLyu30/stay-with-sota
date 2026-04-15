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

  return NextResponse.json({
    success: true,
    providers,
    activeProvider,
  });
}
