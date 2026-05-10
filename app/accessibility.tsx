'use client';

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        background: '#88C0D0',
        color: '#2E3440',
        padding: '8px 16px',
        zIndex: 1000,
        transition: 'top 0.3s',
        textDecoration: 'none',
        fontWeight: 600,
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.top = '0';
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.top = '-40px';
      }}
    >
      跳转到主内容
    </a>
  );
}
