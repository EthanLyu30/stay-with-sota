import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navigation from '@/components/Navigation';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <Navigation />
        <main style={{
          paddingTop: '52px',
          minHeight: '100vh',
          background: '#0B0F19',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '32px',
          }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
