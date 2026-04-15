'use client';

import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: string | number;
  color: string;
}

export default function StatsBar() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: '总简报', value: '—', color: '#3b82f6' },
    { label: '今日新增', value: '—', color: '#60a5fa' },
    { label: '活跃数据源', value: '—', color: '#93c5fd' },
    { label: '上次推送', value: '—', color: '#8b8b8b' },
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
        { label: '总简报', value: total, color: '#3b82f6' },
        { label: '今日新增', value: digestData.items?.[0] ? '✓' : '—', color: '#60a5fa' },
        { label: '活跃数据源', value: sources, color: '#93c5fd' },
        { label: '上次推送', value: digestData.items?.[0]?.emailSent ? '✓ 已推送' : '待推送', color: '#8b8b8b' },
      ]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="stats-grid-4" style={{
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
          background: '#282c34',
          padding: '16px 20px',
        }}>
          <div style={{
            fontSize: '11px',
            color: '#5a5a5a',
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
