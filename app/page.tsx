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
    setFetchStatus('\u6B63\u5728\u8FDE\u63A5\u6570\u636E\u6E90...');

    const steps = [
      '\u6B63\u5728\u6293\u53D6 GitHub Trending...',
      '\u6B63\u5728\u6293\u53D6 ArXiv \u8BBA\u6587...',
      '\u6B63\u5728\u6293\u53D6 HuggingFace...',
      '\u6B63\u5728\u6293\u53D6 Hacker News...',
      '\u6B63\u5728\u53BB\u91CD...',
      '\u6B63\u5728\u8C03\u7528 AI \u6A21\u578B\u7B5B\u9009\uFF08\u672C\u5730\u6A21\u578B\u53EF\u80FD\u9700\u8981 1-3 \u5206\u949F\uFF09...',
      '\u6B63\u5728\u751F\u6210\u7B80\u62A5...',
      '\u6B63\u5728\u53D1\u9001\u90AE\u4EF6...',
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
        setFetchStatus('\u2705 \u6293\u53D6\u5B8C\u6210\uFF01');
        showToast(`\u6293\u53D6\u5B8C\u6210\uFF01\u7CBE\u9009 ${data.digest?.totalFiltered || 0} \u6761\u5185\u5BB9`, 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast(data.error || '\u6293\u53D6\u5931\u8D25', 'error');
        setFetchStatus('');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        showToast('\u6293\u53D6\u8D85\u65F6\uFF08\u8D85\u8FC7 10 \u5206\u949F\uFF09\uFF0C\u8BF7\u91CD\u8BD5', 'error');
      } else {
        showToast('\u6293\u53D6\u8BF7\u6C42\u5931\u8D25: ' + (err.message || ''), 'error');
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
        showToast('\u6D4B\u8BD5\u90AE\u4EF6\u53D1\u9001\u6210\u529F\uFF01', 'success');
      } else {
        showToast(data.error || '\u53D1\u9001\u5931\u8D25', 'error');
      }
    } catch (err) {
      showToast('\u90AE\u4EF6\u53D1\u9001\u5931\u8D25', 'error');
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
          background: 'linear-gradient(135deg, #10b981, #6ee7b7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '3px',
        }}>
          SOTA Daily
        </h1>
        <p style={{
          color: '#555',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
        }}>
          AI \u9886\u57DF\u6700\u65B0\u52A8\u6001\uFF0C\u6BCF\u65E5\u7CBE\u9009\u63A8\u9001
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
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            border: 'none',
            borderRadius: '6px',
            color: '#000',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: fetching ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.01em',
            opacity: fetching ? 0.4 : 1,
            transition: 'all 150ms ease',
          }}
        >
          {fetching ? '\u23F3 \u6293\u53D6\u4E2D...' : '\uD83D\uDD04 \u7ACB\u5373\u6293\u53D6'}
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
              (e.currentTarget as HTMLButtonElement).style.color = '#e8e8e8';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
            (e.currentTarget as HTMLButtonElement).style.color = '#8b8b8b';
          }}
        >
          {sendingEmail ? '\u23F3 \u53D1\u9001\u4E2D...' : '\uD83D\uDCE7 \u53D1\u9001\u6D4B\u8BD5\u90AE\u4EF6'}
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
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '6px',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#e8e8e8' }}>\u6B63\u5728\u6293\u53D6\u4E2D...</div>
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
          color: '#555',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid rgba(255, 255, 255, 0.06)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            marginBottom: '12px',
          }} />
          \u52A0\u8F7D\u4E2D...
        </div>
      ) : latestDigest ? (
        <DigestDetail digest={latestDigest} />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '56px',
          color: '#555',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>\uD83D\uDE80</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#8b8b8b',
            marginBottom: '3px',
            fontFamily: 'var(--font-mono)',
          }}>
            \u6682\u65E0\u7B80\u62A5
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            \u70B9\u51FB\u300C\u7ACB\u5373\u6293\u53D6\u300D\u6309\u94AE\u83B7\u53D6\u6700\u65B0 AI \u9886\u57DF\u52A8\u6001\uFF0C\u6216\u7B49\u5F85\u6BCF\u65E5\u81EA\u52A8\u63A8\u9001
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
          background: '#0c0c0c',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '6px',
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '13px',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          animation: 'slideUp 0.25s ease',
          maxWidth: '400px',
        }}>
          {toast.type === 'success' ? '\u2705' : '\u274C'} {toast.message}
        </div>
      )}
    </div>
  );
}
