import { NextRequest, NextResponse } from 'next/server';

/**
 * HuggingFace API 代理
 * 解决国内网络无法直接访问 HuggingFace 的问题
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/api/daily_papers';

    const targetUrl = `https://huggingface.co${path}`;
    
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `HuggingFace returned ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Proxy] HuggingFace proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch from HuggingFace' }, { status: 502 });
  }
}
