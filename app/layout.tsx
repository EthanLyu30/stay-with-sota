import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navigation from '@/components/Navigation';
import SkipLink from './accessibility';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'SOTA Daily — AI 信息聚合推送',
  description: '自动抓取 AI 领域最新动态，通过 LLM 智能筛选摘要，每日推送至邮箱',
};

export const viewport = {
  themeColor: '#88C0D0',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <SkipLink />
        <Navigation />
        <main id="main-content" style={{
          paddingTop: '56px',
          minHeight: '100vh',
          background: '#2E3440',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px',
          }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
