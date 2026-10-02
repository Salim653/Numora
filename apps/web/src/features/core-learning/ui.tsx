'use client';

import katex from 'katex';
import type { ReactNode } from 'react';
import { LearningApiError } from './api';
import { useStudentToken } from './student-session';

export function LearningFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="learning-frame">
      <h1 className="student-page-title mb-6">{title}</h1>
      {children}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`learning-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
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
  return children(useStudentToken());
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
