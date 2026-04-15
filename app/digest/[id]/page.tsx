'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DigestDetail from '@/components/DigestDetail';
import ExportButton from '@/components/ExportButton';
import type { Digest } from '@/lib/types';

export default function DigestPage() {
  const params = useParams();
  const id = params.id as string;
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/digests/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        if (data.success) {
          setDigest(data.data);
        } else {
          setError('简报未找到');
        }
      })
      .catch(err => {
        setError(err.message || '加载失败');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
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
    );
  }

  if (error || !digest) {
    return (
      <div>
        <Link href="/history" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#5a5a5a',
          fontSize: '13px',
          marginBottom: '20px',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          transition: 'color 150ms ease',
        }}>
          ← 返回历史
        </Link>
        <div style={{
          textAlign: 'center',
          padding: '56px',
          color: '#5a5a5a',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.6 }}>😕</div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#8b8b8b',
            marginBottom: '3px',
            fontFamily: 'var(--font-mono)',
          }}>
            {error || '简报未找到'}
          </div>
          <div style={{
            fontSize: '13px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            该简报可能已被删除或不存在
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link href="/history" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#5a5a5a',
          fontSize: '13px',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#3b82f6'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#5a5a5a'; }}
        >
          ← 返回历史
        </Link>
        <ExportButton digestId={digest.id} date={digest.date} />
      </div>
      <DigestDetail digest={digest} />
    </div>
  );
}
