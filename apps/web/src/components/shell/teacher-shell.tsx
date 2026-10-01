'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ============================================
 * TEACHER SHELL - Layout for teacher pages
 * Consistent with NUMORA design system
 * ============================================ */

export interface TeacherShellProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Teacher name */
  teacherName: string;
  /** Page content */
  children: ReactNode;
  /** Custom right content in header */
  headerRight?: ReactNode;
}

/**
 * NUMORA Teacher Shell
 *
 * Layout for all teacher pages
 * Features: Top bar, sidebar navigation (desktop), page header, content
 */
export function TeacherShell({
  title,
  description,
  teacherName,
  children,
  headerRight,
}: TeacherShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/teacher', label: 'Dashboard', icon: '🏠' },
    { href: '/teacher/classes', label: 'Class Saya', icon: '👥' },
  ];

  const isActive = (href: string) => {
    if (href === '/teacher') return pathname === href || pathname === '/teacher';
    return pathname.startsWith(href);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          padding: '0 var(--page-padding-x)',
          background: 'var(--color-surface-raised)',
          borderBottom: '1px solid var(--color-border)',
          zIndex: 200,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/teacher" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="var(--numora-purple)" />
              <circle cx="16" cy="16" r="10" fill="var(--numora-peach)" />
              <circle cx="12" cy="14" r="3" fill="var(--numora-purple)" />
              <circle cx="20" cy="14" r="3" fill="var(--numora-purple)" />
              <path d="M10 20 Q16 26 22 20" stroke="var(--numora-gold)" strokeWidth="2" fill="none" />
              <text x="38" y="22" fontFamily="var(--font-sans)" fontWeight="800" fontSize="16" fill="var(--color-primary)" letterSpacing="0.08em">NUMORA</text>
            </svg>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {/* Teacher Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 12px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            👨‍🏫 Guru
          </span>

          {/* Header Right Content */}
          {headerRight}

          {/* User Menu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 12px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-secondary)',
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
              {teacherName.split(' ')[0]}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-surface-raised)',
            zIndex: 199,
            padding: 'var(--space-4)',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4)',
                    background: active ? 'var(--color-primary-light)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-text)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 'var(--space-6) var(--page-padding-x)',
          maxWidth: 1000,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Area Guru
          </span>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: 'var(--space-2) 0',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', margin: 0 }}>
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        {children}
      </main>
    </div>
  );
}

/* ============================================
 * TEACHER CLASS CARD
 * Card component for class listing
 * ============================================ */

export interface TeacherClassCardProps {
  /** Class name */
  name: string;
  /** Number of students */
  studentCount: number;
  /** Join code */
  joinCode?: string;
  /** Click handler */
  onClick?: () => void;
  /** Link href */
  href?: string;
}

export function TeacherClassCard({ name, studentCount, joinCode, onClick, href }: TeacherClassCardProps) {
  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: onClick || href ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            width: 56,
            height: 56,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: 28,
          }}
        >
          👥
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
            {name}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            {studentCount} siswa
          </p>
          {joinCode && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
              Kode: <strong>{joinCode}</strong>
            </p>
          )}
        </div>
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        style={{ outline: 'none' }}
      >
        {content}
      </div>
    );
  }

  return content;
}

/* ============================================
 * TEACHER STUDENT ROW
 * Row component for student listing
 * ============================================ */

export interface TeacherStudentRowProps {
  /** Student name */
  name: string;
  /** Latest score */
  latestScore?: number | null;
  /** Best score */
  bestScore?: number | null;
  /** Status */
  status?: 'active' | 'inactive';
  /** Click handler */
  onClick?: () => void;
  /** Link href */
  href?: string;
}

export function TeacherStudentRow({ name, latestScore, bestScore, status, onClick, href }: TeacherStudentRowProps) {
  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--color-surface-raised)',
        borderBottom: '1px solid var(--color-border-light)',
        cursor: onClick || href ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--color-secondary)',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
            {name}
          </p>
          {latestScore !== undefined && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
              Nilai: {latestScore ?? '-'} {bestScore && `• Terbaik: ${bestScore}`}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {status && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status === 'active' ? 'var(--color-success)' : 'var(--color-text-muted)',
            }}
            title={status === 'active' ? 'Aktif' : 'Tidak aktif'}
          />
        )}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        style={{ outline: 'none' }}
      >
        {content}
      </div>
    );
  }

  return content;
}
