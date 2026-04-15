'use client';

import { useEffect, useState } from 'react';
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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
    try {
      const res = await fetch('/api/fetch-now', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`抓取完成！精选 ${data.digest?.totalFiltered || 0} 条内容`, 'success');
        window.location.reload();
      } else {
        showToast(data.error || '抓取失败', 'error');
      }
    } catch (err) {
      showToast('抓取请求失败', 'error');
    } finally {
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
