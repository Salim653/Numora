'use client';

import { type HTMLAttributes } from 'react';

/* ============================================
 * SKELETON COMPONENT
 * Loading placeholder with animation
 * ============================================ */

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonSize = 'sm' | 'md' | 'lg';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'width' | 'height'> {
  /** Skeleton shape variant */
  variant?: SkeletonVariant;
  /** Width of the skeleton */
  width?: string | number | undefined;
  /** Height of the skeleton (for text/rectangular) */
  height?: string | number | undefined;
  /** Border radius override */
  borderRadius?: string;
  /** Animation speed in seconds */
  animationSpeed?: number;
}

/**
 * NUMORA Skeleton Component
 *
 * Animated placeholder for loading states
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="200px" />
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="rectangular" height={120} borderRadius="var(--radius-lg)" />
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  animationSpeed = 1.5,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseStyles: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--color-border-light) 25%, var(--color-surface) 50%, var(--color-border-light) 75%)',
    backgroundSize: '200% 100%',
    animation: `skeleton-shimmer ${animationSpeed}s ease-in-out infinite`,
    width: width ?? (variant === 'text' ? '100%' : variant === 'circular' ? '40px' : '100%'),
    height: height ?? (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '100px'),
    borderRadius: borderRadius ?? (variant === 'circular' ? '50%' : variant === 'text' ? '4px' : 'var(--radius-md)'),
    flexShrink: 0,
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Memuat..."
      className={`numora-skeleton numora-skeleton--${variant} ${className}`}
      style={baseStyles}
      {...props}
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}

Skeleton.displayName = 'Skeleton';

/* ============================================
 * SKELETON GROUP
 * Multiple skeletons together
 * ============================================ */

export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton items */
  count?: number;
  /** Gap between items */
  gap?: string;
  /** Skeleton variant for each item */
  variant?: SkeletonVariant;
  /** Width for each skeleton */
  width?: string | number;
  /** Height for each skeleton */
  height?: string | number;
}

/**
 * NUMORA Skeleton Group Component
 *
 * Multiple skeleton placeholders in a group
 *
 * @example
 * ```tsx
 * <SkeletonGroup count={5} variant="text" />
 * <SkeletonGroup count={3} gap="12px">
 *   <Skeleton variant="circular" width={32} height={32} />
 *   <Skeleton variant="rectangular" height={60} />
 * </SkeletonGroup>
 * ```
 */
export function SkeletonGroup({
  count = 3,
  gap = 'var(--space-2)',
  variant = 'text',
  width,
  height,
  children,
  className = '',
  style,
  ...props
}: SkeletonGroupProps) {
  if (children) {
    return (
      <div
        className={`numora-skeleton-group ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`numora-skeleton-group ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        ...style,
      }}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          width={width}
          height={height}
        />
      ))}
    </div>
  );
}

SkeletonGroup.displayName = 'SkeletonGroup';

/* ============================================
 * CARD SKELETON
 * Skeleton for card loading state
 * ============================================ */

export interface CardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Show header skeleton */
  showHeader?: boolean;
  /** Show footer skeleton */
  showFooter?: boolean;
  /** Number of content lines */
  contentLines?: number;
}

/**
 * NUMORA Card Skeleton Component
 *
 * Skeleton placeholder for card loading state
 *
 * @example
 * ```tsx
 * <CardSkeleton contentLines={3} showHeader />
 * ```
 */
export function CardSkeleton({
  showHeader = false,
  showFooter = false,
  contentLines = 2,
  className = '',
  style,
  ...props
}: CardSkeletonProps) {
  return (
    <div
      className={`numora-skeleton-card ${className}`}
      style={{
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        ...style,
      }}
      {...props}
    >
      {showHeader && (
        <Skeleton variant="text" width="60%" height={24} />
      )}

      <SkeletonGroup count={contentLines} gap="var(--space-2)">
        <Skeleton variant="text" width={contentLines === 1 ? '40%' : '100%'} height={16} />
        {contentLines > 1 && (
          <Skeleton variant="text" width="80%" height={16} />
        )}
        {contentLines > 2 && (
          <Skeleton variant="text" width="60%" height={16} />
        )}
      </SkeletonGroup>

      {showFooter && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <Skeleton variant="rectangular" width={100} height={36} borderRadius="var(--radius-md)" />
        </div>
      )}
    </div>
  );
}

CardSkeleton.displayName = 'CardSkeleton';

/* ============================================
 * LIST ROW SKELETON
 * Skeleton for list row loading state
 * ============================================ */

export interface ListRowSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Show avatar placeholder */
  showAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
}

/**
 * NUMORA List Row Skeleton Component
 *
 * Skeleton placeholder for list row loading state
 *
 * @example
 * ```tsx
 * <ListRowSkeleton showAvatar lines={2} />
 * ```
 */
export function ListRowSkeleton({
  showAvatar = true,
  lines = 1,
  className = '',
  style,
  ...props
}: ListRowSkeletonProps) {
  return (
    <div
      className={`numora-skeleton-list-row ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        ...style,
      }}
      {...props}
    >
      {showAvatar && (
        <Skeleton variant="circular" width={44} height={44} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={i === 0 ? '70%' : '40%'}
            height={14}
          />
        ))}
      </div>

      <Skeleton variant="rectangular" width={24} height={24} borderRadius="var(--radius-sm)" />
    </div>
  );
}

ListRowSkeleton.displayName = 'ListRowSkeleton';
