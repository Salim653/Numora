'use client';

import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { learningApi } from './api';
import { useAuth } from '@/features/onboarding/auth';
import { StudentLayout } from '@/components/shell';
import { LearningProvider } from './provider';
import type { AssessmentRecord } from './types';

/* ============================================
 * ASSESSMENT HISTORY PAGE
 * View drill and tryout history
 * ============================================ */

export function AssessmentScreen() {
  return (
    <StudentGate>
      {(token) => (
        <StudentLayout title="Riwayat Aktivitas">
          <AssessmentContent token={token} />
        </StudentLayout>
      )}
    </StudentGate>
  );
}

function StudentGate({ children }: { children: (token: string) => React.ReactNode }) {
  const { state, refresh } = useAuth();

  if (state.status === 'loading') {
    return (
      <StudentLayout title="Memuat...">
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
          Memuat...
        </div>
      </StudentLayout>
    );
  }

  if (state.status === 'error') {
    return (
      <StudentLayout title="Error">
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-danger)' }}>{state.message}</p>
          <button onClick={() => void refresh()}>Coba Lagi</button>
        </div>
      </StudentLayout>
    );
  }

  if (state.status === 'ready' && state.profile.role === 'STUDENT') {
    return <LearningProvider key={state.session.access_token}>{children(state.session.access_token)}</LearningProvider>;
  }

  return (
    <StudentLayout title="Akses Ditolak">
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p>Halaman ini hanya untuk siswa.</p>
      </div>
    </StudentLayout>
  );
}

function AssessmentContent({ token }: { token: string }) {
  const query = useInfiniteQuery({
    queryKey: ['assessment-history'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => learningApi.assessmentHistory(token, pageParam),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });

  if (query.isPending) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1, 2, 3].map((i: number) => (
          <div key={i} style={{
            height: 80,
            background: 'var(--color-surface-raised)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
          }} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>⚠️</span>
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>Gagal memuat riwayat</p>
        <button onClick={() => void query.refetch()}>Coba Lagi</button>
      </div>
    );
  }

  const records = query.data.pages.flatMap((page) => page.records);

  if (!records.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-12)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 'var(--space-4)' }}>📝</span>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: '0 0 var(--space-2)' }}>
          Belum Ada Aktivitas
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-6)' }}>
          Mulai drill untuk melihat riwayat aktivitasmu
        </p>
        <Link
          href="/student/learn"
          style={{
            display: 'inline-block',
            padding: 'var(--space-3) var(--space-5)',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Mulai Belajar
        </Link>
      </div>
    );
  }

  // Group by type
  const drills = records.filter((r) => r.activity === 'drill');
  const tryouts = records.filter((r) => r.activity === 'tryout');

  return (
    <div>
      {/* Drill History */}
      {drills.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            🎯 Drill ({drills.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {drills.map((item: AssessmentRecord) => (
              <HistoryCard key={item.attemptId} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Tryout History */}
      {tryouts.length > 0 && (
        <div>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            📋 TryOut ({tryouts.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {tryouts.map((item: AssessmentRecord) => (
              <HistoryCard key={item.attemptId} item={item} />
            ))}
          </div>
        </div>
      )}
      {query.hasNextPage && (
        <button className="secondary-button" disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}>
          {query.isFetchingNextPage ? 'Memuat…' : 'Muat hasil lain'}
        </button>
      )}
      {query.isFetchNextPageError && <p className="form-error" role="alert">Halaman berikutnya belum dapat dimuat.</p>}
    </div>
  );
}

function HistoryCard({ item }: { item: AssessmentRecord }) {
  const isDrill = item.activity === 'drill';
  const href = isDrill
    ? `/student/drill/${item.attemptId}/result`
    : `/student/tryout/${item.attemptId}/result`;

  const date = new Date(item.submittedAt);
  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Score color
  const scoreColor = item.score && item.score >= 80
    ? 'var(--color-success)'
    : item.score && item.score >= 60
      ? 'var(--color-warning)'
      : 'var(--color-danger)';

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          width: 48,
          height: 48,
          display: 'grid',
          placeItems: 'center',
          background: isDrill ? 'var(--color-primary-light)' : 'var(--numora-soft-100)',
          borderRadius: 'var(--radius-md)',
          fontSize: 24,
        }}>
          {isDrill ? '🎯' : '📋'}
        </div>
        <div>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
            {isDrill ? 'Drill' : 'TryOut'} - {item.title} {item.isDemo && <span className="eyebrow">Demo</span>}
          </p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            {formattedDate}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: scoreColor, margin: 0 }}>
          {item.score ?? (item.resultState === 'waitingIrt' ? '⏳' : '—')}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
          {item.resultState === 'waitingIrt' ? 'IRT' : (isDrill ? 'nilai' : 'poin')}
        </p>
      </div>
    </Link>
  );
}
