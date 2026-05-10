import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SOTA Daily - AI 信息聚合推送',
    short_name: 'SOTA Daily',
    description: '自动抓取 AI 领域最新动态，通过 LLM 智能筛选摘要，每日推送至邮箱',
    start_url: '/',
    display: 'standalone',
    background_color: '#2E3440',
    theme_color: '#88C0D0',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
