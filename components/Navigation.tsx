'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⚡' },
  { href: '/history', label: '历史简报', icon: '📋' },
  { href: '/settings', label: '设置', icon: '⚙️' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      background: 'rgba(46, 52, 64, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(216, 222, 233, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <span style={{ fontSize: '18px', lineHeight: 1 }}>❄️</span>
        <span style={{
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: '#88C0D0',
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
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                textDecoration: 'none',
                color: isActive ? '#88C0D0' : '#D8DEE9',
                background: isActive ? 'rgba(136, 192, 208, 0.1)' : 'transparent',
                transition: 'all 150ms ease',
              }}
            >
              <span style={{ fontSize: '14px' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Online Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: isOnline ? '#A3BE8C' : '#BF616A',
          boxShadow: isOnline
            ? '0 0 8px rgba(163, 190, 140, 0.5)'
            : '0 0 8px rgba(191, 97, 106, 0.5)',
          display: 'inline-block',
        }} />
        <span style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#4C566A',
        }}>
          {isOnline ? 'online' : 'offline'}
        </span>
      </div>
    </header>
  );
}
