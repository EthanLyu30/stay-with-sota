'use client';

import React from 'react';
import { useStats } from '@/lib/hooks';

const accentColors = [
  '#88C0D0', // ice blue
  '#81A1C1', // frost blue
  '#A3BE8C', // green
  '#B48EAD', // purple
];

function StatsBar() {
  const { stats, isLoading } = useStats();

  const statItems = stats ? [
    { label: '总简报', value: stats.totalDigests },
    { label: '今日新增', value: stats.todayItems > 0 ? '✓' : '—' },
    { label: '活跃数据源', value: stats.activeSources },
    { label: '上次推送', value: stats.lastEmailSent ? '✓ 已推送' : '待推送' },
  ] : [
    { label: '总简报', value: '—' },
    { label: '今日新增', value: '—' },
    { label: '活跃数据源', value: '—' },
    { label: '上次推送', value: '—' },
  ];

  if (isLoading) {
    return (
      <div className="stats-grid-4" style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            background: '#3B4252',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(216, 222, 233, 0.08)',
          }}>
            <div className="skeleton" style={{ height: '11px', width: '60px', borderRadius: '4px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '22px', width: '40px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid-4" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '24px',
    }}>
      {statItems.map((stat, i) => (
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

export default React.memo(StatsBar);
