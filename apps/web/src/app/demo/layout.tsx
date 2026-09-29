'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import './demo.css';

const navigation = [
  { href: '/demo/student', label: 'Beranda', icon: '⌂' },
  { href: '/demo/pvp', label: 'PvP', icon: '⚔' },
  { href: '/demo/leaderboards', label: 'Peringkat', icon: '★' },
];

export default function DemoLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="demo-app">
      <aside className="demo-sidebar" aria-label="Navigasi prototype">
        <Link className="demo-brand" href="/demo/student">
          <span className="demo-brand-mark" aria-hidden="true">
            N
          </span>
          <span>
            NUMORA<span className="demo-brand-subtitle">Ruang belajar matematika</span>
          </span>
        </Link>
        <div className="demo-sidebar-label">JELAJAHI</div>
        <nav className="demo-nav" aria-label="Navigasi utama">
          {navigation.map((item) => (
            <Link
              key={item.href}
              className={`demo-nav-link ${pathname === item.href ? 'is-active' : ''}`}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className="demo-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="demo-sidebar-note">
          <span className="demo-pill">MODE DEMO</span>
          <p>Contoh tampilan dan interaksi. Tidak memakai akun, data siswa, atau skor nyata.</p>
        </div>
      </aside>

      <div className="demo-main">
        <header className="demo-topbar">
          <Link
            className="demo-mobile-brand"
            href="/demo/student"
            aria-label="NUMORA, ke beranda demo"
          >
            <span className="demo-brand-mark" aria-hidden="true">
              N
            </span>
            <strong>NUMORA</strong>
          </Link>
          <span className="demo-topbar-caption">Prototype interaktif</span>
          <span className="demo-pill">DATA FIKTIF</span>
        </header>
        <main className="demo-content">{children}</main>
      </div>

      <nav className="demo-bottom-nav" aria-label="Navigasi prototype mobile">
        {navigation.map((item) => (
          <Link
            key={item.href}
            className={pathname === item.href ? 'is-active' : ''}
            href={item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
