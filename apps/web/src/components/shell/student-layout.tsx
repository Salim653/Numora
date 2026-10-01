'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ============================================
 * STUDENT LAYOUT - Reusable student page layout
 * Features: Top bar, bottom nav, page header, content
 * ============================================ */

export interface StudentLayoutProps {
  /** Page title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Page content */
  children: ReactNode;
  /** User name */
  userName?: string;
  /** User XP */
  userXp?: number;
  /** Hide bottom nav (for assessment pages) */
  hideBottomNav?: boolean;
  /** Back link href */
  backHref?: string;
  /** Breadcrumb items */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Custom right content in top bar */
  topBarRight?: ReactNode;
}

/**
 * NUMORA Student Layout
 *
 * Reusable layout for all student pages
 * Includes: Top bar with branding, bottom navigation, page header, content area
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StudentLayout title="Pilih Bab">
 *   <ChapterList />
 * </StudentLayout>
 *
 * // With back button and breadcrumbs
 * <StudentLayout
 *   title="Bab 1"
 *   backHref="/student/learn"
 *   breadcrumbs={[
 *     { label: 'Belajar', href: '/student/learn' },
 *     { label: 'Bab 1' }
 *   ]}
 * >
 *   <SubchapterList />
 * </StudentLayout>
 * ```
 */
export function StudentLayout({
  title,
  subtitle,
  children,
  userName: _userName,
  userXp,
  hideBottomNav = false,
  backHref,
  breadcrumbs,
  topBarRight,
}: StudentLayoutProps) {
  const pathname = usePathname();

  // Determine active tab
  const getActiveTab = () => {
    if (pathname === '/student' || pathname === '/student/') return '/student';
    if (pathname.startsWith('/student/learn')) return '/student/learn';
    if (pathname.startsWith('/student/tryout')) return '/student/tryout';
    if (pathname.startsWith('/student/profile')) return '/student/profile';
    return pathname;
  };

  const navItems = [
    { href: '/student', label: 'Beranda', icon: '🏠' },
    { href: '/student/learn', label: 'Belajar', icon: '📚' },
    { href: '/student/tryout', label: 'TryOut', icon: '📋' },
    { href: '/student/profile', label: 'Profil', icon: '👤' },
  ];

  const isActive = (href: string) => {
    const active = getActiveTab();
    if (href === '/student') return active === href;
    return active.startsWith(href);
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
          height: 56,
          padding: '0 var(--page-padding-x)',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border-light)',
          zIndex: 200,
        }}
      >
        <Link href="/student" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* NUMORA Logo - Inline SVG for consistency */}
          <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="var(--numora-purple)" />
            <circle cx="16" cy="16" r="10" fill="var(--numora-peach)" />
            <circle cx="12" cy="14" r="3" fill="var(--numora-purple)" />
            <circle cx="20" cy="14" r="3" fill="var(--numora-purple)" />
            <path d="M10 20 Q16 26 22 20" stroke="var(--numora-gold)" strokeWidth="2" fill="none" />
            <text x="38" y="22" fontFamily="var(--font-sans)" fontWeight="800" fontSize="16" fill="var(--color-primary)" letterSpacing="0.08em">NUMORA</text>
          </svg>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {userXp !== undefined && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--numora-gold-700)',
                background: 'var(--color-reward-light)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              ✦ {userXp} XP
            </span>
          )}
          {topBarRight}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 'var(--space-4) var(--page-padding-x)',
          paddingBottom: hideBottomNav ? 'var(--space-4)' : 'calc(var(--space-4) + 64px + env(safe-area-inset-bottom, 0px))',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          {/* Back Button */}
          {backHref && (
            <Link
              href={backHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                textDecoration: 'none',
                marginBottom: 'var(--space-3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Kembali
            </Link>
          )}

          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-2)',
              }}
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--color-text)' }}>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Title */}
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-2)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Page Content */}
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <nav
          aria-label="Navigasi utama"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 64,
            background: 'var(--color-surface-raised)',
            borderTop: '1px solid var(--color-border)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            zIndex: 300,
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  padding: 'var(--space-2) var(--space-3)',
                  minWidth: 64,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    lineHeight: 1,
                    filter: active ? 'none' : 'grayscale(0.3)',
                    transition: 'transform var(--transition-fast)',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                  }}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: active ? 700 : 500,
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/* ============================================
 * ASSESSMENT LAYOUT - For drill/tryout pages
 * Full-screen focus mode without navigation
 * ============================================ */

export interface AssessmentLayoutProps {
  /** Page title */
  title: string;
  /** Extra header content (timer, progress, etc.) */
  headerExtra?: ReactNode;
  /** Page content */
  children: ReactNode;
  /** Back link handler */
  onBack?: () => void;
  /** Back link href (for Link-based navigation) */
  backHref?: string;
}

export function AssessmentLayout({
  title,
  headerExtra,
  children,
  onBack,
  backHref,
}: AssessmentLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
      }}
    >
      {/* Assessment Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          padding: '0 var(--page-padding-x)',
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border-light)',
          zIndex: 200,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Kembali
            </button>
          )}
          {backHref && (
            <Link
              href={backHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                textDecoration: 'none',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Kembali
            </Link>
          )}
          <h1
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>
        {headerExtra && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {headerExtra}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 'var(--space-4) var(--page-padding-x)',
          maxWidth: 'var(--content-max-width)',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </main>
    </div>
  );
}
