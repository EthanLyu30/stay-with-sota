'use client';

import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: string | number;
}

const accentColors = [
  '#88C0D0', // ice blue
  '#81A1C1', // frost blue
  '#A3BE8C', // green
  '#B48EAD', // purple
];

export default function StatsBar() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: '总简报', value: '—' },
    { label: '今日新增', value: '—' },
    { label: '活跃数据源', value: '—' },
    { label: '上次推送', value: '—' },
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
        { label: '总简报', value: total },
        { label: '今日新增', value: digestData.items?.[0] ? '✓' : '—' },
        { label: '活跃数据源', value: sources },
        { label: '上次推送', value: digestData.items?.[0]?.emailSent ? '✓ 已推送' : '待推送' },
      ]);
    }).catch((err) => {
      console.error('[StatsBar] Failed to load stats:', err);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="stats-grid-4" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '24px',
    }}>
      {stats.map((stat, i) => (
        <div key={i} style={{
          background: '#3B4252',
          border: '1px solid rgba(216, 222, 233, 0.08)',
          borderRadius: '8px',
          padding: '20px',
          borderLeft: `3px solid ${accentColors[i]}`,
          transition: 'border-color 150ms ease',
        }}>
          <div style={{
            fontSize: '11px',
            color: '#4C566A',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            marginBottom: '8px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {stat.label}
          </div>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            fontFamily: 'var(--font-sans)',
            color: '#ECEFF4',
            letterSpacing: '-0.02em',
          }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
