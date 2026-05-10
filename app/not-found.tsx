import Link from 'next/link';

export default function NotFound() {
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
        fontSize: '120px',
        fontWeight: 800,
        color: '#4C566A',
        lineHeight: 1,
        marginBottom: '16px',
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.04em',
      }}>
        404
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: 600,
        color: '#D8DEE9',
        marginBottom: '8px',
        fontFamily: 'var(--font-sans)',
      }}>
        页面未找到
      </div>
      <div style={{
        fontSize: '14px',
        color: '#4C566A',
        marginBottom: '32px',
        lineHeight: 1.6,
        fontFamily: 'var(--font-sans)',
      }}>
        请检查 URL 是否正确，或返回首页
      </div>
      <Link href="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#88C0D0',
        fontSize: '14px',
        textDecoration: 'none',
        fontFamily: 'var(--font-sans)',
        transition: 'color 150ms ease',
      }}>
        ← 返回首页
      </Link>
    </div>
  );
}
