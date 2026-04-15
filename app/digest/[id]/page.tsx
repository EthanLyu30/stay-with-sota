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
    );
  }

  if (error || !digest) {
    return (
      <div>
        <Link href="/history" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#475569',
          fontSize: '13px',
          marginBottom: '24px',
          textDecoration: 'none',
          fontFamily: 'var(--font-sans)',
          transition: 'color 200ms ease',
        }}>
          ← 返回历史
        </Link>
        <div style={{
          textAlign: 'center',
          padding: '64px',
          color: '#475569',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(248, 113, 113, 0.08)',
            border: '1px solid rgba(248, 113, 113, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>
            😕
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#94a3b8',
            marginBottom: '8px',
            fontFamily: 'var(--font-sans)',
          }}>
            {error || '简报未找到'}
          </div>
          <div style={{
            fontSize: '14px',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            该简报可能已被删除或不存在
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href="/history" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#475569',
          fontSize: '13px',
          textDecoration: 'none',
          fontFamily: 'var(--font-sans)',
          transition: 'color 200ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#818CF8'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569'; }}
        >
          ← 返回历史
        </Link>
        <ExportButton digestId={digest.id} date={digest.date} />
      </div>
      <DigestDetail digest={digest} />
    </div>
  );
}
