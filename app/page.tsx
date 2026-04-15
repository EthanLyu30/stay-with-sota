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
      const timeoutId = setTimeout(() => controller.abort(), 600000);

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
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: '#3b82f6',
          marginBottom: '3px',
        }}>
          SOTA Daily
        </h1>
        <p style={{
          color: '#5a5a5a',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
        }}>
          AI 领域最新动态，每日精选推送
        </p>
      </div>

      <SearchBar />
      <StatsBar />

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleFetchNow}
          disabled={fetching}
          style={{
            height: '32px',
            padding: '0 14px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '6px',
            color: '#f0f0f0',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: fetching ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.01em',
            opacity: fetching ? 0.4 : 1,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            if (!fetching) (e.currentTarget as HTMLButtonElement).style.background = '#60a5fa';
          }}
          onMouseLeave={e => {
            if (!fetching) (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
          }}
        >
          {fetching ? '⏳ 抓取中...' : '🔄 立即抓取'}
        </button>
        <button
          onClick={handleTestEmail}
          disabled={sendingEmail}
          style={{
            height: '32px',
            padding: '0 14px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#8b8b8b',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            cursor: sendingEmail ? 'not-allowed' : 'pointer',
            opacity: sendingEmail ? 0.4 : 1,
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            if (!sendingEmail) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.2)';
              (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f0';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#8b8b8b';
          }}
        >
          {sendingEmail ? '⏳ 发送中...' : '📧 发送测试邮件'}
        </button>
        {latestDigest && (
          <ExportButton digestId={latestDigest.id} date={latestDigest.date} />
        )}
      </div>

      {/* Fetch Status */}
      {fetchStatus && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#282c34',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '6px',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#f0f0f0' }}>正在抓取中...</div>
            <div style={{ fontSize: '13px', color: '#8b8b8b' }}>{fetchStatus}</div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px',
          color: '#5a5a5a',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            marginBottom: '12px',
          }} />
          加载中...
        </div>
      ) : latestDigest ? (
        <DigestDetail digest={latestDigest} />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '56px',
          color: '#5a5a5a',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>🚀</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#8b8b8b',
            marginBottom: '3px',
            fontFamily: 'var(--font-mono)',
          }}>
            暂无简报
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            点击「立即抓取」按钮获取最新 AI 领域动态，或等待每日自动推送
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '8px 16px',
          background: '#282c34',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '6px',
          color: toast.type === 'success' ? '#22c55e' : '#ef4444',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          zIndex: 1000,
          animation: 'slideUp 0.25s ease',
          maxWidth: '400px',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
