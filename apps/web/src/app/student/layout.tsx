'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/onboarding/auth';
import { StudentAccess } from '@/features/core-learning/student-session';
import './student.css';

const navigation = [
  { href: '/student', label: 'Beranda', icon: '⌂' },
  { href: '/student/learn', label: 'Latihan', icon: '✎' },
  { href: '/student/tryout', label: 'Tryout', icon: '▤' },
  { href: '/student/assessment', label: 'Penilaian', icon: '✓' },
  { href: '/student/pvp', label: 'PvP', icon: '⚔' },
  { href: '/student/leaderboards', label: 'Peringkat', icon: '★' },
];
function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, logout } = useAuth();
  const active = (href: string) =>
    href === '/student'
      ? pathname === href
      : pathname.startsWith(href) ||
        (href === '/student/learn' && pathname.startsWith('/student/drill'));
  const links = (mobile = false) =>
    navigation.map((item) => (
      <Link
        key={item.href}
        className={`${mobile ? '' : 'student-nav-link'} ${active(item.href) ? 'is-active' : ''}`}
        href={item.href}
        aria-current={active(item.href) ? 'page' : undefined}
      >
        <span className={mobile ? '' : 'student-nav-icon'} aria-hidden="true">
          {item.icon}
        </span>
        {mobile ? <small>{item.label}</small> : item.label}
      </Link>
    ));
  return (
    <div className="student-app">
      <a href="#student-content" className="student-skip">
        Langsung ke konten
      </a>
      <aside className="student-sidebar" aria-label="Navigasi siswa">
        <Link className="student-brand" href="/student">
          <span className="student-brand-mark" aria-hidden="true">
            N
          </span>
          <span>
            NUMORA<span className="student-brand-subtitle">Ruang belajar matematika</span>
          </span>
        </Link>
        <div className="student-sidebar-label">JELAJAHI</div>
        <nav className="student-nav" aria-label="Navigasi utama">
          {links()}
        </nav>
        <div className="student-sidebar-note">
          <p>Belajar bertahap, tumbuh setiap hari.</p>
        </div>
      </aside>
      <div className="student-main">
        <header className="student-topbar">
          <Link className="student-mobile-brand" href="/student" aria-label="NUMORA, ke beranda">
            <span className="student-brand-mark" aria-hidden="true">
              N
            </span>
            <strong>NUMORA</strong>
          </Link>
          <span className="student-topbar-caption">
            {state.status === 'ready' ? state.profile.displayName : 'Ruang belajar'}
          </span>
          <button className="student-button student-button-outline" onClick={() => void logout()}>
            Keluar
          </button>
        </header>
        <main id="student-content" tabIndex={-1} className="student-content">
          {children}
        </main>
      </div>
      <nav className="student-bottom-nav" aria-label="Navigasi mobile">
        {links(true)}
      </nav>
    </div>
  );
}
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentAccess>
      <StudentShell>{children}</StudentShell>
    </StudentAccess>
  );
}
