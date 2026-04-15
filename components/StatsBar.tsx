'use client';

import { useEffect, useState } from 'react';
import type { Stats } from '@/lib/types';

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({
    totalDigests: 0,
    todayItems: 0,
    activeSources: 0,
    lastEmailSent: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/digests?page=1&pageSize=1')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(prev => ({ ...prev, totalDigests: data.total || 0 }));
        }
      })
      .catch(() => {});

    fetch('/api/sources')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const active = (data.data || []).filter((s: { enabled: boolean }) => s.enabled).length;
          setStats(prev => ({ ...prev, activeSources: active }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="stats-bar"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-label">总简报数</div>
        <div className="stat-value green">{stats.totalDigests}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">今日新增</div>
        <div className="stat-value blue">{stats.todayItems}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">活跃数据源</div>
        <div className="stat-value purple">{stats.activeSources}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">上次推送</div>
        <div className="stat-value pink" style={{ fontSize: '14px' }}>
          {stats.lastEmailSent ? '✅ 已推送' : '⏳ 待推送'}
        </div>
      </div>
    </div>
  );
}
