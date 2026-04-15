'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '\u26A1', label: 'Dashboard' },
  { href: '/history', icon: '\uD83D\uDCDC', label: '\u5386\u53F2\u7B80\u62A5' },
  { href: '/settings', icon: '\u2699\uFE0F', label: '\u8BBE\u7F6E' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ fontSize: '20px' }}>\u26A1</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          SOTA Daily
        </span>
      </Link>

      {/* Nav Links */}
      <nav style={{ display: 'flex', gap: '4px' }}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
              color: pathname === item.href ? '#10b981' : '#9ca3af',
              background: pathname === item.href ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              transition: 'all 150ms ease',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }} />
        online
      </div>
    </header>
  );
}
