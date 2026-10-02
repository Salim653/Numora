'use client';
import type { ReactNode } from 'react';
import { AppShell } from './app-shell';
export function StudentLayout({
  title,
  subtitle,
  children,
  hideBottomNav,
  backHref,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  hideBottomNav?: boolean;
  backHref?: string;
}) {
  return (
    <AppShell title={title} subtitle={subtitle} backHref={backHref} focus={hideBottomNav}>
      {children}
    </AppShell>
  );
}
