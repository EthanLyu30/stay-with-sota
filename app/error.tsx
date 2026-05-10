'use client';

import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 56px)',
      paddingTop: '56px',
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'rgba(191, 97, 106, 0.08)',
        border: '1px solid rgba(191, 97, 106, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '28px',
      }}>
        ⚠️
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: 600,
        color: '#D8DEE9',
        marginBottom: '8px',
        fontFamily: 'var(--font-sans)',
      }}>
        出了点问题
      </div>
      <div style={{
        fontSize: '14px',
        color: '#4C566A',
        marginBottom: '32px',
        lineHeight: 1.6,
        fontFamily: 'var(--font-sans)',
        maxWidth: '400px',
      }}>
        {error.message}
      </div>
      <div style={{
        display: 'flex',
        gap: '12px',
      }}>
        <button
          onClick={reset}
          style={{
            height: '36px',
            padding: '0 20px',
            background: '#88C0D0',
            border: 'none',
            borderRadius: '8px',
            color: '#2E3440',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#81A1C1';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#88C0D0';
          }}
        >
          重试
        </button>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '36px',
          padding: '0 20px',
          background: 'transparent',
          border: '1px solid rgba(136, 192, 208, 0.2)',
          borderRadius: '8px',
          color: '#88C0D0',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          textDecoration: 'none',
          transition: 'all 150ms ease',
          lineHeight: '36px',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(136, 192, 208, 0.1)';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(136, 192, 208, 0.3)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
          (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(136, 192, 208, 0.2)';
        }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
