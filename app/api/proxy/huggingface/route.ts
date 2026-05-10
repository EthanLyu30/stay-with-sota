import { NextRequest, NextResponse } from 'next/server';

/**
 * HuggingFace API 代理
 * 解决国内网络无法直接访问 HuggingFace 的问题
 *
 * 安全说明：
 * - 路径白名单限制：仅允许 /api/、/papers/、/spaces/ 开头的路径
 * - 速率限制由 middleware 统一处理
 */

// 允许的路径前缀白名单
const ALLOWED_PATH_PREFIXES = ['/api/', '/papers/', '/spaces/'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/api/daily_papers';

    // 路径白名单验证
    const isAllowed = ALLOWED_PATH_PREFIXES.some(prefix => path.startsWith(prefix));
    if (!isAllowed) {
      return NextResponse.json(
        { error: '不允许访问该路径' },
        { status: 400 }
      );
    }

    // 防止路径遍历攻击
    const normalizedPath = path.replace(/\/+/g, '/').replace(/\.\./g, '');
    const targetUrl = `https://huggingface.co${normalizedPath}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[Proxy] HuggingFace returned ${res.status} for path: ${normalizedPath}`);
      return NextResponse.json(
        { error: '获取 HuggingFace 数据失败' },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[Proxy] HuggingFace proxy error:', err);
    return NextResponse.json(
      { error: '代理请求失败，请稍后再试' },
      { status: 502 }
    );
  }
}
