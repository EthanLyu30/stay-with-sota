'use client';

import { useEffect, useState, useRef } from 'react';
import StatsBar from '@/components/StatsBar';
import DigestDetail from '@/components/DigestDetail';
import SearchBar from '@/components/SearchBar';
import ExportButton from '@/components/ExportButton';
import type { Digest } from '@/lib/types';

export default function DashboardPage() {
  const [latestDigest, setLatestDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [fetchStatus, setFetchStatus] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetch('/api/digests?page=1&pageSize=1')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.items && data.items.length > 0) {
          return fetch(`/api/digests/${data.items[0].id}`);
        }
        return null;
      })
      .then(r => r ? r.json() : null)
      .then(data => {
        if (data?.success && data.data) {
          setLatestDigest(data.data);
        }
      })
      .catch(err => console.error('Failed to load digest:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleFetchNow = async () => {
    setFetching(true);
    setFetchStatus('正在连接数据源...');

    // 进度提示动画
    const steps = [
      '正在抓取 GitHub Trending...',
      '正在抓取 ArXiv 论文...',
      '正在抓取 HuggingFace...',
      '正在抓取 Hacker News...',
      '正在去重...',
      '正在调用 AI 模型筛选（本地模型可能需要 1-3 分钟）...',
      '正在生成简报...',
      '正在发送邮件...',
    ];
    let stepIdx = 0;
    fetchTimerRef.current = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setFetchStatus(steps[stepIdx]);
    }, 8000);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 分钟超时

      const res = await fetch('/api/fetch-now', {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success) {
        setFetchStatus('✅ 抓取完成！');
        showToast(`抓取完成！精选 ${data.digest?.totalFiltered || 0} 条内容`, 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(data.error || '抓取失败', 'error');
        setFetchStatus('');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('抓取超时（超过 10 分钟），请重试', 'error');
      } else {
        showToast('抓取请求失败: ' + (err.message || ''), 'error');
      }
      setFetchStatus('');
    } finally {
      if (fetchTimerRef.current) clearInterval(fetchTimerRef.current);
      setFetching(false);
    }
  };

  const handleTestEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/test-email', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('测试邮件发送成功！', 'success');
      } else {
        showToast(data.error || '发送失败', 'error');
      }
    } catch (err) {
      showToast('邮件发送失败', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚡ SOTA Daily</h1>
        <p className="page-subtitle">AI 领域最新动态，每日精选推送</p>
      </div>

      <SearchBar />
      <StatsBar />

      <div className="action-bar">
        <button
          className="btn btn-primary"
          onClick={handleFetchNow}
          disabled={fetching}
        >
          {fetching ? '⏳ 抓取中...' : '🔄 立即抓取'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleTestEmail}
          disabled={sendingEmail}
        >
          {sendingEmail ? '⏳ 发送中...' : '📧 发送测试邮件'}
        </button>
        {latestDigest && (
          <ExportButton digestId={latestDigest.id} date={latestDigest.date} />
        )}
      </div>

      {fetchStatus && (
        <div className="card" style={{
          marginBottom: '24px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderColor: 'var(--border-accent)',
        }}>
          <div className="loading-spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>正在抓取中...</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{fetchStatus}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
          <div>加载中...</div>
        </div>
      ) : latestDigest ? (
        <DigestDetail digest={latestDigest} />
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <div className="empty-state-title">暂无简报</div>
          <div className="empty-state-text">
            点击「立即抓取」按钮获取最新 AI 领域动态，或等待每日自动推送
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
