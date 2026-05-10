import { NextRequest, NextResponse } from 'next/server';

/**
 * 安全中间件
 * - 添加安全响应头
 * - API 速率限制
 * - 敏感路由认证检查
 */

// ============ 速率限制配置 ============

interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  '/api/fetch-now': { maxRequests: 3, windowMs: 10 * 60 * 1000 },
  '/api/test-email': { maxRequests: 5, windowMs: 10 * 60 * 1000 },
};

// 需要认证的敏感路由前缀
const AUTH_REQUIRED_PREFIXES = [
  '/api/fetch-now',
  '/api/test-email',
  '/api/cron',
];

// 公开路由（无速率限制）
const PUBLIC_ROUTES = [
  '/api/digests',
  '/api/search',
  '/api/providers',
  '/api/health',
];

// ============ 速率限制存储 ============

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 定期清理过期条目，防止内存泄漏
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}

function checkRateLimit(
  ip: string,
  routeKey: string,
  rule: RateLimitRule
): boolean {
  const key = `${ip}:${routeKey}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + rule.windowMs });
    return true;
  }

  if (entry.count >= rule.maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// ============ 路由匹配工具 ============

function matchRoute(pathname: string): {
  isApi: boolean;
  isPublic: boolean;
  rateLimitKey: string | null;
  rateLimitRule: RateLimitRule | null;
  needsAuth: boolean;
  method: string;
} {
  // 检查是否是公开路由
  for (const publicRoute of PUBLIC_ROUTES) {
    if (pathname === publicRoute || pathname.startsWith(publicRoute + '/')) {
      return {
        isApi: true,
        isPublic: true,
        rateLimitKey: null,
        rateLimitRule: null,
        needsAuth: false,
        method: '',
      };
    }
  }

  // 检查精确匹配的速率限制规则
  for (const [pattern, rule] of Object.entries(RATE_LIMIT_RULES)) {
    if (pathname === pattern) {
      return {
        isApi: true,
        isPublic: false,
        rateLimitKey: pattern,
        rateLimitRule: rule,
        needsAuth: AUTH_REQUIRED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/')),
        method: '',
      };
    }
  }

  // /api/sources POST: 10 req / 10min
  if (pathname === '/api/sources') {
    return {
      isApi: true,
      isPublic: false,
      rateLimitKey: 'sources-post',
      rateLimitRule: { maxRequests: 10, windowMs: 10 * 60 * 1000 },
      needsAuth: false,
      method: 'sources',
    };
  }

  // /api/sources/[id] PATCH/DELETE: 20 req / 10min
  if (/^\/api\/sources\/[^/]+$/.test(pathname)) {
    return {
      isApi: true,
      isPublic: false,
      rateLimitKey: 'sources-id-mutation',
      rateLimitRule: { maxRequests: 20, windowMs: 10 * 60 * 1000 },
      needsAuth: false,
      method: 'sources-id',
    };
  }

  // /api/cron 需要认证
  if (pathname === '/api/cron') {
    return {
      isApi: true,
      isPublic: false,
      rateLimitKey: null,
      rateLimitRule: null,
      needsAuth: true,
      method: 'cron',
    };
  }

  // 其他 /api/* 路由: 60 req / min
  if (pathname.startsWith('/api/')) {
    return {
      isApi: true,
      isPublic: false,
      rateLimitKey: 'api-default',
      rateLimitRule: { maxRequests: 60, windowMs: 60 * 1000 },
      needsAuth: false,
      method: 'default-api',
    };
  }

  return {
    isApi: false,
    isPublic: false,
    rateLimitKey: null,
    rateLimitRule: null,
    needsAuth: false,
    method: '',
  };
}

// ============ 中间件主逻辑 ============

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. 添加安全头到所有响应
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 非 API 路由直接放行
  if (!pathname.startsWith('/api/')) {
    return response;
  }

  const routeInfo = matchRoute(pathname);

  // 公开路由直接放行（仅有安全头）
  if (routeInfo.isPublic) {
    return response;
  }

  // 2. 认证检查（仅对敏感路由）
  if (routeInfo.needsAuth) {
    const apiSecret = process.env.API_SECRET;
    if (apiSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${apiSecret}`) {
        return NextResponse.json(
          { error: '未授权访问' },
          { status: 401 }
        );
      }
    }
  }

  // /api/sources POST 也需要认证
  if (pathname === '/api/sources' && request.method === 'POST') {
    const apiSecret = process.env.API_SECRET;
    if (apiSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${apiSecret}`) {
        return NextResponse.json(
          { error: '未授权访问' },
          { status: 401 }
        );
      }
    }
  }

  // /api/sources/[id] PATCH/DELETE 也需要认证
  if (/^\/api\/sources\/[^/]+$/.test(pathname) && (request.method === 'PATCH' || request.method === 'DELETE')) {
    const apiSecret = process.env.API_SECRET;
    if (apiSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${apiSecret}`) {
        return NextResponse.json(
          { error: '未授权访问' },
          { status: 401 }
        );
      }
    }
  }

  // 3. 速率限制检查
  if (routeInfo.rateLimitRule) {
    const ip = getClientIp(request);
    const allowed = checkRateLimit(ip, routeInfo.rateLimitKey!, routeInfo.rateLimitRule);
    if (!allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试' },
        { status: 429 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    // 匹配所有路由（包括 API 和页面）
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
