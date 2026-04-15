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
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#edf2f7',
          marginBottom: '6px',
          letterSpacing: '-0.03em',
        }}>
          SOTA Daily
        </h1>
        <p style={{
          color: '#475569',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
        }}>
          AI 领域最新动态，每日精选推送
        </p>
      </div>

      <SearchBar />
      <StatsBar />

      {/* Action Bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '28px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleFetchNow}
          disabled={fetching}
          style={{
            height: '36px',
            padding: '0 18px',
            background: '#818CF8',
            border: 'none',
            borderRadius: '8px',
            color: '#0B0F19',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: fetching ? 'not-allowed' : 'pointer',
            opacity: fetching ? 0.5 : 1,
            transition: 'all 200ms ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            if (!fetching) (e.currentTarget as HTMLButtonElement).style.background = '#a5b4fc';
          }}
          onMouseLeave={e => {
            if (!fetching) (e.currentTarget as HTMLButtonElement).style.background = '#818CF8';
          }}
        >
          {fetching ? '⏳ 抓取中...' : '🔄 立即抓取'}
        </button>
        <button
          onClick={handleTestEmail}
          disabled={sendingEmail}
          style={{
            height: '36px',
            padding: '0 18px',
            background: 'transparent',
            border: '1px solid rgba(129, 140, 248, 0.2)',
            borderRadius: '8px',
            color: '#818CF8',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            cursor: sendingEmail ? 'not-allowed' : 'pointer',
            opacity: sendingEmail ? 0.5 : 1,
            transition: 'all 200ms ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={e => {
            if (!sendingEmail) {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(129, 140, 248, 0.1)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129, 140, 248, 0.3)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(129, 140, 248, 0.2)';
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
          marginBottom: '28px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: '#111827',
          border: '1px solid rgba(129, 140, 248, 0.15)',
          borderRadius: '12px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#818CF8',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#edf2f7', fontSize: '14px' }}>正在抓取中...</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{fetchStatus}</div>
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
          color: '#475569',
          fontSize: '13px',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#818CF8',
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
          padding: '64px',
          color: '#475569',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(129, 140, 248, 0.08)',
            border: '1px solid rgba(129, 140, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>
            🚀
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '8px',
            fontFamily: 'var(--font-sans)',
          }}>
            暂无简报
          </div>
          <div style={{
            fontSize: '14px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            点击「立即抓取」按钮获取最新 AI 领域动态，或等待每日自动推送
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          background: '#111827',
          border: `1px solid ${toast.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
          borderRadius: '12px',
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          animation: 'slideUp 0.25s ease',
          maxWidth: '400px',
        }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  );
}
