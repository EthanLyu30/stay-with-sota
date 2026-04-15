'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '⚡', label: 'Dashboard' },
  { href: '/history', icon: '📋', label: '历史简报' },
  { href: '/settings', icon: '⚙️', label: '设置' },
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
      background: 'rgba(31, 34, 40, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ fontSize: '20px' }}>⚡</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: '#3b82f6',
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
              color: pathname === item.href ? '#3b82f6' : '#8b8b8b',
              background: pathname === item.href ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              transition: 'all 150ms ease',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5a5a5a', fontFamily: 'var(--font-mono)' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
        online
      </div>
    </header>
  );
}
