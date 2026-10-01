'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from '@tka/ui';
import { XPBadge } from '@tka/ui';

/* ============================================
 * STUDENT SHELL COMPONENT
 * Main layout wrapper for student pages
 * Features: Top bar, bottom nav, content area
 * ============================================ */

export interface StudentShellProps {
  /** Page content */
  children: ReactNode;
  /** User display name */
  userName: string;
  /** User XP */
  userXp?: number;
  /** User affiliation */
  userAffiliation?: 'MANDIRI' | 'SEKOLAH';
  /** Class name (if school) */
  className?: string;
  /** Hide bottom nav (e.g., during assessment) */
  hideBottomNav?: boolean;
}

/**
 * NUMORA Student Shell
 *
 * Main layout for authenticated student pages
 * Includes top bar with branding and XP, content area, and bottom navigation
 *
 * @example
 * ```tsx
 * <StudentShell userName="Budi" userXp={150}>
 *   <DashboardContent />
 * </StudentShell>
 * ```
 */
export function StudentShell({
  children,
  userName: _userName,
  userXp,
  userAffiliation: _userAffiliation = 'MANDIRI',
  className,
  hideBottomNav = false,
}: StudentShellProps) {
  const pathname = usePathname();

  // Determine active tab based on pathname
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
      className="student-shell"
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
        <Link href="/student" style={{ display: 'flex', alignItems: 'center' }}>
          <Brand />
        </Link>

        {userXp !== undefined && (
          <XPBadge xp={userXp} />
        )}
      </header>

      {/* Main Content */}
      <main
        className={className}
        style={{
          flex: 1,
          padding: 'var(--space-4) var(--page-padding-x)',
          paddingBottom: hideBottomNav ? 'var(--space-4)' : 'calc(var(--space-4) + 64px + env(safe-area-inset-bottom, 0px))',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
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
                    fontWeight: active ? 'var(--font-bold)' : 'var(--font-medium)',
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
 * GREETING SECTION COMPONENT
 * For student dashboard
 * ============================================ */

export interface GreetingSectionProps {
  name: string;
  affiliation?: 'MANDIRI' | 'SEKOLAH';
  classInfo?: string;
}

export function GreetingSection({ name, affiliation, classInfo }: GreetingSectionProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const statusBadge = () => {
    if (affiliation === 'SEKOLAH') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-success)',
            background: 'var(--color-success-light)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          📚 User Sekolah {classInfo && `- ${classInfo}`}
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '4px 10px',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-info)',
          background: 'var(--color-info-light)',
          borderRadius: 'var(--radius-full)',
        }}
      >
        🌟 User Mandiri
      </span>
    );
  };

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h1
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--font-extrabold)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
          lineHeight: 'var(--leading-tight)',
        }}
      >
        {getGreeting()}, {name}! 👋
      </h1>
      {statusBadge()}
    </div>
  );
}

/* ============================================
 * SECTION HEADER COMPONENT
 * ============================================ */

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}

/* ============================================
 * FEATURE GRID COMPONENT
 * ============================================ */

export interface FeatureItem {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string | number;
}

export interface FeatureGridProps {
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}

export function FeatureGrid({ items, columns = 2 }: FeatureGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--space-3)',
      }}
    >
      {items.map((item, index) => {
        const content = (
          <>
            <span style={{ fontSize: 32, lineHeight: 1 }} aria-hidden="true">
              {item.icon}
            </span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)',
                textAlign: 'center',
              }}
            >
              {item.label}
            </span>
            {item.badge && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 20,
                  height: 20,
                  padding: '0 6px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text-inverse)',
                  background: 'var(--color-danger)',
                  borderRadius: 'var(--radius-full)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {item.badge}
              </span>
            )}
          </>
        );

        const tileStyle: React.CSSProperties = {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-4)',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          textDecoration: 'none',
          transition: 'all var(--transition-fast)',
          minHeight: 100,
          position: 'relative',
          opacity: item.disabled ? 0.5 : 1,
        };

        if (item.disabled) {
          return (
            <div key={index} style={tileStyle} aria-disabled="true">
              {content}
            </div>
          );
        }

        if (item.href) {
          return (
            <Link key={item.href} href={item.href} style={tileStyle}>
              {content}
            </Link>
          );
        }

        return (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={item.onClick}
            onKeyDown={(e) => e.key === 'Enter' && item.onClick?.()}
            style={tileStyle}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================
 * PROGRESS CARD COMPONENT
 * ============================================ */

export interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  label?: string;
  href?: string;
}

export function ProgressCard({ title, current, total, label, href }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const cardContent = (
    <div
      style={{
        padding: 'var(--space-4)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: 24,
          }}
        >
          📊
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-extrabold)',
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {current}
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-normal)', color: 'var(--color-text-muted)' }}>
              /{total}
            </span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        style={{
          width: '100%',
          height: 8,
          background: 'var(--color-border-light)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-slow)',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {label || `${percentage}% selesai`}
        </span>
        {href && (
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            Lanjutkan →
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none' }}>{cardContent}</Link>;
  }

  return cardContent;
}

/* ============================================
// STAT CARD COMPONENT
// ============================================ */

export interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  variant?: 'default' | 'gold';
}

export function StatCard({ icon, value, label, variant = 'default' }: StatCardProps) {
  const bgColor = variant === 'gold' ? 'var(--color-reward-light)' : 'var(--color-surface-raised)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: bgColor,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <span
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-extrabold)',
            color: 'var(--color-text)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-1)',
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/* ============================================
// PAGE HEADER COMPONENT
// ============================================ */

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backHref, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        marginBottom: 'var(--space-6)',
      }}
    >
      {backHref && (
        <Link
          href={backHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-semibold)',
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-extrabold)',
              color: 'var(--color-text)',
              margin: 0,
            }}
          >
            {title}
          </h1>
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
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================
// LIST ROW COMPONENT
// ============================================ */

export interface ListRowProps {
  leading?: ReactNode;
  title: string;
  description?: string;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export function ListRow({ leading, title, description, trailing, href, onClick }: ListRowProps) {
  const content = (
    <>
      {leading && (
        <div
          style={{
            width: 44,
            height: 44,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-primary)',
            flexShrink: 0,
            fontSize: 20,
          }}
        >
          {leading}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text)',
            display: 'block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </span>
        {description && (
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </span>
        )}
      </div>
      {trailing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
          {trailing}
        </div>
      )}
      {href && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  );

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    background: href || onClick ? 'var(--color-surface-raised)' : 'transparent',
    borderRadius: href || onClick ? 'var(--radius-md)' : 0,
    cursor: href || onClick ? 'pointer' : 'default',
    transition: 'background var(--transition-fast)',
    textDecoration: 'none',
    color: 'inherit',
  };

  if (href) {
    return <Link href={href} style={rowStyle}>{content}</Link>;
  }

  if (onClick) {
    return (
      <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()} style={rowStyle}>
        {content}
      </div>
    );
  }

  return <div style={rowStyle}>{content}</div>;
}

/* ============================================
// EMPTY STATE COMPONENT
// ============================================ */

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-4)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 'var(--space-4)', lineHeight: 1 }}>{icon}</div>
      <h3
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text)',
          margin: '0 0 var(--space-2) 0',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-6) 0',
            maxWidth: 300,
          }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

/* ============================================
// SKELETON COMPONENTS
// ============================================ */

export function Skeleton({ width, height, variant = 'text' }: { width?: string | number; height?: string | number; variant?: 'text' | 'rectangular' | 'circular' }) {
  return (
    <div
      className="numora-skeleton"
      style={{
        width: width ?? (variant === 'text' ? '100%' : '100px'),
        height: height ?? (variant === 'text' ? '1em' : '100px'),
        borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? 4 : 'var(--radius-md)',
        flexShrink: 0,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        <Skeleton width={48} height={48} variant="rectangular" />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={14} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width="40%" height={24} />
          </div>
        </div>
      </div>
      <Skeleton height={8} />
    </div>
  );
}
