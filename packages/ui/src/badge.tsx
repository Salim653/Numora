'use client';

import { forwardRef, type HTMLAttributes } from 'react';

/* ============================================
 * BADGE COMPONENT
 * Status indicators and labels
 * ============================================ */

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold'
  | 'peach';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Dot indicator (no text) */
  dot?: boolean;
  /** Outlined style */
  outlined?: boolean;
}

/* Variant-specific styles */
const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: 'var(--color-surface)',
    text: 'var(--color-text-muted)',
    border: 'var(--color-border)',
  },
  primary: {
    bg: 'var(--color-primary-light)',
    text: 'var(--color-primary)',
    border: 'var(--numora-purple-200)',
  },
  secondary: {
    bg: 'var(--numora-soft-100)',
    text: 'var(--numora-soft-700)',
    border: 'var(--numora-soft-200)',
  },
  success: {
    bg: 'var(--color-success-light)',
    text: 'var(--color-text)',
    border: 'var(--color-success)',
  },
  warning: {
    bg: 'var(--color-warning-light)',
    text: 'var(--color-text)',
    border: 'var(--color-warning)',
  },
  danger: {
    bg: 'var(--color-danger-light)',
    text: 'var(--color-danger)',
    border: 'var(--color-danger)',
  },
  info: {
    bg: 'var(--color-info-light)',
    text: 'var(--color-info)',
    border: 'var(--color-info)',
  },
  gold: {
    bg: 'var(--color-reward-light)',
    text: 'var(--numora-gold-700)',
    border: 'var(--numora-gold-300)',
  },
  peach: {
    bg: 'var(--color-accent-light)',
    text: 'var(--numora-peach-700)',
    border: 'var(--numora-peach-300)',
  },
};

/* Size-specific styles */
const sizeStyles: Record<BadgeSize, { padding: string; fontSize: string; dotSize: string }> = {
  sm: {
    padding: '2px 6px',
    fontSize: 'var(--text-xs)',
    dotSize: '6px',
  },
  md: {
    padding: '4px 10px',
    fontSize: 'var(--text-sm)',
    dotSize: '8px',
  },
};

/**
 * NUMORA Badge Component
 *
 * Features:
 * - Multiple color variants
 * - Multiple sizes
 * - Dot indicator mode
 * - Outlined style option
 *
 * @example
 * ```tsx
 * <Badge variant="primary" size="md">Tersedia</Badge>
 * <Badge variant="success" dot>Terselesaikan</Badge>
 * <Badge variant="warning" outlined>Menunggu</Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      outlined = false,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const colors = variantStyles[variant];
    const sizes = sizeStyles[size];

    return (
      <span
        ref={ref}
        className={`numora-badge numora-badge--${variant} numora-badge--${size} ${outlined ? 'numora-badge--outlined' : ''} ${dot ? 'numora-badge--dot' : ''} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: dot ? '6px' : '4px',
          padding: dot ? sizes.dotSize : sizes.padding,
          fontSize: sizes.fontSize,
          fontWeight: 'var(--font-semibold)',
          lineHeight: 1,
          borderRadius: 'var(--radius-full)',
          background: outlined ? 'transparent' : colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          whiteSpace: 'nowrap',
          ...style,
        }}
        {...props}
      >
        {dot && (
          <span
            style={{
              width: sizes.dotSize,
              height: sizes.dotSize,
              borderRadius: '50%',
              background: colors.text,
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        )}
        {!dot && children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

/* ============================================
 * STATUS BADGE PRESETS
 * Common status patterns for NUMORA
 * ============================================ */

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'available' | 'in-progress' | 'completed' | 'locked' | 'pending' | 'waiting';
}

/**
 * Pre-configured status badges
 *
 * @example
 * ```tsx
 * <StatusBadge status="available" />
 * <StatusBadge status="completed">Nilai: 90</StatusBadge>
 * ```
 */
export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    available: { variant: 'success', label: 'Tersedia' },
    'in-progress': { variant: 'info', label: 'Berlangsung' },
    completed: { variant: 'gold', label: 'Selesai' },
    locked: { variant: 'default', label: 'Terkunci' },
    pending: { variant: 'warning', label: 'Menunggu' },
    waiting: { variant: 'secondary', label: 'Menunggu IRT' },
  };

  const config = statusConfig[status] ?? { variant: 'default' as BadgeVariant, label: 'Tersedia' };

  return (
    <Badge variant={config.variant} {...props}>
      {children || config.label}
    </Badge>
  );
}

StatusBadge.displayName = 'StatusBadge';

/* ============================================
 * LEVEL BADGE
 * For displaying level numbers
 * ============================================ */

export interface LevelBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  level: number;
  total?: number;
}

/**
 * Level indicator badge
 *
 * @example
 * ```tsx
 * <LevelBadge level={1} />
 * <LevelBadge level={3} total={5} />
 * ```
 */
export function LevelBadge({ level, total, ...props }: LevelBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Level {level}
      {total ? `/${total}` : ''}
    </Badge>
  );
}

LevelBadge.displayName = 'LevelBadge';

/* ============================================
 * XP BADGE
 * For displaying experience points
 * ============================================ */

export interface XPBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  xp: number;
  showPlus?: boolean;
}

/**
 * XP/Experience badge with gold styling
 *
 * @example
 * ```tsx
 * <XPBadge xp={150} />
 * <XPBadge xp={25} showPlus>+25 XP</XPBadge>
 * ```
 */
export function XPBadge({ xp, showPlus, ...props }: XPBadgeProps) {
  return (
    <Badge variant="gold" {...props}>
      ✦ {showPlus ? '+' : ''}
      {xp} XP
    </Badge>
  );
}

XPBadge.displayName = 'XPBadge';

/* ============================================
 * STAR RATING BADGE
 * For displaying achievement stars
 * ============================================ */

export interface StarBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  stars: number;
  maxStars?: number;
}

/**
 * Star rating badge
 *
 * @example
 * ```tsx
 * <StarBadge stars={3} />
 * <StarBadge stars={2} maxStars={3} />
 * ```
 */
export function StarBadge({ stars, maxStars = 3, ...props }: StarBadgeProps) {
  const starIcons = Array.from({ length: maxStars }, (_, i) => (i < stars ? '★' : '☆')).join('');

  return (
    <Badge variant="gold" {...props}>
      {starIcons}
    </Badge>
  );
}

StarBadge.displayName = 'StarBadge';
