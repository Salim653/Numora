'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import katex from 'katex';
import type { ReactNode } from 'react';
import { destination, useAuth } from '@/features/onboarding/auth';
import { LearningApiError } from './api';
import { LearningProvider } from './provider';

export function LearningFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <Link className="text-lg font-extrabold text-[var(--numora-purple)]" href="/student">
          NUMORA
        </Link>
        <nav
          aria-label="Navigasi Student"
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold"
        >
          <Link className="hover:underline" href="/student">
            Beranda
          </Link>
          <Link className="hover:underline" href="/student/learn">
            Practice & Drill
          </Link>
          <Link className="hover:underline" href="/student/tryout">
            TryOut
          </Link>
          <Link className="hover:underline" href="/student/assessment">
            Penilaian
          </Link>
        </nav>
      </header>
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {children}
    </main>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
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
      className="min-h-11 rounded-xl bg-[var(--numora-purple)] px-5 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
