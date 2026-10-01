'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ============================================
 * ADMIN SHELL - Layout for admin pages
 * Clean, functional design for operational work
 * ============================================ */

export interface AdminShellProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Page content */
  children: ReactNode;
  /** Custom navigation items */
  navItems?: Array<{ href: string; label: string }>;
  /** Current nav item */
  currentNav?: string;
  /** On nav change */
  onNavChange?: (nav: string) => void;
}

/**
 * NUMORA Admin Shell
 *
 * Layout for all admin pages
 * Features: Top bar, tab navigation, content area
 */
export function AdminShell({
  title,
  description,
  children,
  navItems = [],
  currentNav,
  onNavChange,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const defaultNavItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'content', label: 'Konten', href: '/admin/content' },
    { id: 'schools', label: 'Sekolah', href: '/admin/schools' },
  ];

  const items = navItems.length > 0
    ? navItems.map(item => ({ id: item.href, label: item.label, href: item.href }))
    : defaultNavItems;

  const activeNav = currentNav || items.find(item => pathname === item.href)?.id || items[0]?.id;

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
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
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

        {/* Admin Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '6px 12px',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--numora-purple-700)',
            background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          ⚙️ Admin
        </span>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '0 var(--page-padding-x)',
          background: 'var(--color-surface-raised)',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
        {items.map((item) => {
          const isActive = item.id === activeNav;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (onNavChange) {
                  onNavChange(item.id);
                } else {
                  window.location.href = item.href;
                }
              }}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: 'var(--space-6) var(--page-padding-x)',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0' }}>
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
 * ADMIN STAT CARD
 * Stats display for admin dashboard
 * ============================================ */

export interface AdminStatCardProps {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Icon */
  icon?: string;
  /** Trend indicator */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend value */
  trendValue?: string;
  /** Color variant */
  variant?: 'default' | 'primary' | 'warning' | 'success';
}

export function AdminStatCard({ label, value, icon, trend, trendValue, variant = 'default' }: AdminStatCardProps) {
  const colors = {
    default: { bg: 'var(--color-surface-raised)', border: 'var(--color-border)', accent: 'var(--color-primary)' },
    primary: { bg: 'var(--color-primary-light)', border: 'var(--numora-purple-200)', accent: 'var(--color-primary)' },
    warning: { bg: 'var(--color-warning-light)', border: 'var(--color-warning)', accent: 'var(--color-warning)' },
    success: { bg: 'var(--color-success-light)', border: 'var(--color-success)', accent: 'var(--color-success)' },
  };

  const color = colors[variant];

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: 'var(--space-2) 0 0 0', lineHeight: 1 }}>
            {value}
          </p>
        </div>
        {icon && (
          <span style={{ fontSize: 32 }}>{icon}</span>
        )}
      </div>
      {trend && trendValue && (
        <p style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-danger)' : 'var(--color-text-muted)',
          margin: 'var(--space-2) 0 0 0',
        }}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </p>
      )}
    </div>
  );
}

/* ============================================
 * ADMIN TABLE
 * Data table component for admin pages
 * ============================================ */

export interface AdminTableColumn<T> {
  /** Column key */
  key: keyof T | string;
  /** Column header */
  header: string;
  /** Custom render function */
  render?: (item: T, index: number) => ReactNode;
  /** Width */
  width?: string;
}

export interface AdminTableProps<T> {
  /** Data items */
  items: T[];
  /** Columns configuration */
  columns: AdminTableColumn<T>[];
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Row href (for Link) */
  rowHref?: (item: T) => string;
  /** Empty message */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
}

export function AdminTable<T extends { id?: string }>({
  items,
  columns,
  onRowClick,
  rowHref,
  emptyMessage = 'Tidak ada data',
  loading = false,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
      }}>
        Memuat data...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{
        padding: 'var(--space-8)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--color-surface-raised)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          gap: 'var(--space-4)',
        }}
      >
        {columns.map((col) => (
          <span
            key={String(col.key)}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              width: col.width,
            }}
          >
            {col.header}
          </span>
        ))}
      </div>

      {/* Rows */}
      {items.map((item, index) => {
        const rowContent = (
          <div
            key={item.id || index}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: index < items.length - 1 ? '1px solid var(--color-border-light)' : 'none',
              gap: 'var(--space-4)',
              alignItems: 'center',
            }}
          >
            {columns.map((col) => (
              <div key={String(col.key)} style={{ minWidth: 0 }}>
                {col.render
                  ? col.render(item, index)
                  : String(item[col.key as keyof T] ?? '')}
              </div>
            ))}
          </div>
        );

        if (rowHref) {
          return (
            <Link
              key={item.id || index}
              href={rowHref(item)}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {rowContent}
            </Link>
          );
        }

        if (onRowClick) {
          return (
            <div
              key={item.id || index}
              role="button"
              tabIndex={0}
              onClick={() => onRowClick(item)}
              onKeyDown={(e) => e.key === 'Enter' && onRowClick(item)}
              style={{ outline: 'none' }}
            >
              {rowContent}
            </div>
          );
        }

        return <div key={item.id || index}>{rowContent}</div>;
      })}
    </div>
  );
}
