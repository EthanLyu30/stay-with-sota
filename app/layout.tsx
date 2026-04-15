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
  title: 'SOTA Daily \u2014 AI \u4FE1\u606F\u805A\u5408\u63A8\u9001',
  description: '\u81EA\u52A8\u6293\u53D6 AI \u9886\u57DF\u6700\u65B0\u52A8\u6001\uFF0C\u901A\u8FC7 LLM \u667A\u80FD\u7B5B\u9009\u6458\u8981\uFF0C\u6BCF\u65E5\u63A8\u9001\u81F3\u90AE\u7BB1',
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
          paddingTop: '56px',
          minHeight: '100vh',
          background: '#000000',
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
