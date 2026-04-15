'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/history', icon: '📜', label: '历史简报' },
  { href: '/settings', icon: '⚙️', label: '设置' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? '✕' : '☰'}
      </button>
      <nav className={`navigation ${isOpen ? 'open' : ''}`}>
        <Link href="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="nav-logo-icon">⚡</span>
          <span className="nav-logo-text">SOTA Daily</span>
        </Link>

        <div className="nav-section-title">导航</div>
        <ul className="nav-links">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ flex: 1 }} />

        <div className="nav-section-title">关于</div>
        <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div>Stay with SOTA</div>
          <div style={{ marginTop: '4px' }}>AI 信息聚合推送系统</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            v0.1.0
          </div>
        </div>
      </nav>
    </>
  );
}
