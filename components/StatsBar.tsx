'use client';

import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: string | number;
  color: string;
}

export default function StatsBar() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: '\u603B\u7B80\u62A5', value: '\u2014', color: '#10b981' },
    { label: '\u4ECA\u65E5\u65B0\u589E', value: '\u2014', color: '#34d399' },
    { label: '\u6D3B\u8DC3\u6570\u636E\u6E90', value: '\u2014', color: '#6ee7b7' },
    { label: '\u4E0A\u6B21\u63A8\u9001', value: '\u2014', color: '#9ca3af' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/digests?page=1&pageSize=1').then(r => r.json()),
      fetch('/api/sources').then(r => r.json()),
    ]).then(([digestData, sourceData]) => {
      const total = digestData.total || 0;
      const sources = (sourceData.data || []).filter((s: { enabled: boolean }) => s.enabled).length;
      setStats([
        { label: '\u603B\u7B80\u62A5', value: total, color: '#10b981' },
        { label: '\u4ECA\u65E5\u65B0\u589E', value: digestData.items?.[0] ? '\u2713' : '\u2014', color: '#34d399' },
        { label: '\u6D3B\u8DC3\u6570\u636E\u6E90', value: sources, color: '#6ee7b7' },
        { label: '\u4E0A\u6B21\u63A8\u9001', value: digestData.items?.[0]?.emailSent ? '\u2713 \u5DF2\u63A8\u9001' : '\u5F85\u63A8\u9001', color: '#9ca3af' },
      ]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1px',
      background: 'rgba(255, 255, 255, 0.06)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '24px',
    }}>
      {stats.map((stat, i) => (
        <div key={i} style={{
          background: '#000000',
          padding: '16px 20px',
        }}>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}>
            {stat.label}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: stat.color,
          }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
