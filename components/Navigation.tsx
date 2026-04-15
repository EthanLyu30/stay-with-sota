'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/history', label: '历史简报' },
  { href: '/settings', label: '设置' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '52px',
      background: 'rgba(11, 15, 25, 0.9)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#818CF8',
          boxShadow: '0 0 8px rgba(129, 140, 248, 0.4)',
          display: 'inline-block',
        }} />
        <span style={{
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#edf2f7',
          letterSpacing: '-0.02em',
        }}>
          SOTA Daily
        </span>
      </Link>

      {/* Nav Links */}
      <nav style={{ display: 'flex', gap: '2px' }}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                textDecoration: 'none',
                color: isActive ? '#818CF8' : '#94a3b8',
                background: isActive ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                borderBottom: isActive ? '2px solid #818CF8' : '2px solid transparent',
                transition: 'all 200ms ease',
                marginBottom: '-2px',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Keyboard shortcut hint */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#475569',
        }}>
          <span style={{ fontSize: '11px' }}>⌘</span>
          <span>K</span>
        </div>
      </div>
    </header>
  );
}
