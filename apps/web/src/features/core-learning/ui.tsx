'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import katex from 'katex';
import type { ReactNode } from 'react';
import { Brand } from '@tka/ui';
import { destination, useAuth } from '@/features/onboarding/auth';
import { LearningApiError } from './api';
import { LearningProvider } from './provider';

export function LearningFrame({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const links = [
    { href: '/student', label: 'Beranda' },
    { href: '/student/learn', label: 'Latihan' },
    { href: '/student/assessment', label: 'Progres' },
    { href: '/student/tryout', label: 'TryOut' },
  ];
  return (
    <main className="learning-shell">
      <header className="learning-header">
        <Link href="/student" aria-label="NUMORA, ke beranda"><Brand /></Link>
        <span className="learning-xp" title="XP belum tersedia">✦ XP —</span>
        <nav aria-label="Navigasi Siswa" className="learning-nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              aria-current={pathname === link.href || (link.href !== '/student' && pathname.startsWith(`${link.href}/`)) ? 'page' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="learning-content">
        <h1 className="learning-title">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`learning-panel ${className}`}
    >
      {children}
    </section>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="learning-primary-button"
      {...props}
    >
      {children}
    </button>
  );
}

export function Status({ children, title = 'Perhatian' }: { children: ReactNode; title?: string }) {
  return (
    <Panel>
      <h2 className="font-bold">{title}</h2>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </Panel>
  );
}

export function DataState({
  error,
  pending,
  retry,
}: {
  error: unknown;
  pending: boolean;
  retry: () => void;
}) {
  if (pending) return <Status title="Memuat">Mengambil data belajar…</Status>;
  const status = error instanceof LearningApiError ? error.status : 0;
  const message = error instanceof Error ? error.message : 'Data belum dapat dimuat.';
  return (
    <Status
      title={
        status === 401
          ? 'Sesi berakhir'
          : status === 403
            ? 'Akses ditolak'
            : status === 404
              ? 'Tidak ditemukan'
              : 'Gagal memuat'
      }
    >
      <p>{message}</p>
      <button className="mt-3 font-semibold text-[var(--numora-purple)] underline" onClick={retry}>
        Coba lagi
      </button>
    </Status>
  );
}

export function StudentGate({ children }: { children: (token: string) => ReactNode }) {
  const { state, refresh } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (state.status === 'signed_out') router.replace('/');
    if (state.status === 'registration') router.replace('/onboarding');
    if (state.status === 'ready' && state.profile.role !== 'STUDENT')
      router.replace(destination(state.profile));
  }, [router, state]);
  if (state.status === 'ready' && state.profile.role === 'STUDENT') {
    const token = state.session.access_token;
    return <LearningProvider key={token}>{children(token)}</LearningProvider>;
  }
  if (state.status === 'error')
    return (
      <Status title="Sesi belum siap">
        <p>{state.message}</p>
        <button className="mt-3 underline" onClick={() => void refresh()}>
          Periksa lagi
        </button>
      </Status>
    );
  if (state.status === 'disabled')
    return <Status title="Akun tidak aktif">Akses akun ini sedang tidak tersedia.</Status>;
  return <Status title="Memeriksa akses">Mohon tunggu…</Status>;
}

export function MathText({ value }: { value: string }) {
  const parts = value.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (!part.startsWith('$') || !part.endsWith('$')) return <span key={index}>{part}</span>;
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(part.slice(1, -1), {
                  throwOnError: true,
                  trust: false,
                }),
              }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      })}
    </>
  );
}
