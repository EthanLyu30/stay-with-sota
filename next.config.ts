import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false, // 移除 X-Powered-By 响应头
  compress: true, // 启用 gzip 压缩
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['@upstash/redis'],
  },
};

export default nextConfig;
