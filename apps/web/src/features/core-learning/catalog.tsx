'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { learningApi } from './api';
import { useAuth } from '@/features/onboarding/auth';
import { LearningProvider } from './provider';
import { StudentLayout } from '@/components/shell';

/* ============================================
 * SHARED GATE COMPONENT
 * ============================================ */

function StudentGate({ children }: { children: (token: string) => React.ReactNode }) {
  const { state, refresh } = useAuth();

  if (state.status === 'loading') {
    return (
      <StudentLayout title="Memuat...">
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
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
          <button onClick={() => void refresh()} style={{ marginTop: 'var(--space-4)' }}>
            Coba Lagi
          </button>
        </div>
      </StudentLayout>
    );
  }

  if (state.status === 'ready' && state.profile.role === 'STUDENT') {
    return <LearningProvider key={state.session.access_token}>{children(state.session.access_token)}</LearningProvider>;
  }

  return null;
}

/* ============================================
 * CATALOG SCREEN - Chapter listing page
 * ============================================ */

export function CatalogScreen() {
  return (
    <StudentGate>
      {(token) => (
        <StudentLayout title="Pilih Bab">
          <CatalogContent token={token} />
        </StudentLayout>
      )}
    </StudentGate>
  );
}

function CatalogContent({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ['chapters'],
    queryFn: () => learningApi.catalog(token),
  });

  if (query.isPending) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 80,
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>Gagal memuat data</p>
        <button
          onClick={() => void query.refetch()}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!query.data.chapters.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-12)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>📚</span>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 var(--space-2) 0' }}>
          Materi Belum Tersedia
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
          Bab belum diterbitkan. Cek kembali nanti.
        </p>
      </div>
    );
  }

  const sortedChapters = [...query.data.chapters].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {sortedChapters.map((chapter) => (
        <Link
          key={chapter.id}
          href={`/student/learn/${chapter.id}`}
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
          <h3 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
          }}>
            {chapter.title}
          </h3>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ))}
    </div>
  );
}

/* ============================================
 * CHAPTER SCREEN - Subchapter listing
 * ============================================ */

export function ChapterScreen() {
  const { chapterId } = useParams<{ chapterId: string }>();

  return (
    <StudentGate>
      {(token) => (
        <StudentLayout
          title="Pilih Subbab"
          backHref="/student/learn"
        >
          <ChapterContent token={token} chapterId={chapterId} />
        </StudentLayout>
      )}
    </StudentGate>
  );
}

function ChapterContent({ token, chapterId }: { token: string; chapterId: string }) {
  const query = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => learningApi.chapter(token, chapterId),
  });

  if (query.isPending) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 72, background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>Gagal memuat data</p>
        <button onClick={() => void query.refetch()}>Coba Lagi</button>
      </div>
    );
  }

  if (!query.data.subchapters.length) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>📖</span>
        <p>Belum ada subbab pada bab ini.</p>
      </div>
    );
  }

  const sortedSubchapters = [...query.data.subchapters].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {sortedSubchapters.map((subchapter) => (
        <Link
          key={subchapter.id}
          href={`/student/learn/${chapterId}/${subchapter.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
          }}
        >
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              {subchapter.title}
            </h3>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ))}
    </div>
  );
}

/* ============================================
 * SUBCHAPTER SCREEN - Level selection
 * ============================================ */

export function SubchapterScreen() {
  const { chapterId, subchapterId } = useParams<{ chapterId: string; subchapterId: string }>();
  const router = useRouter();

  return (
    <StudentGate>
      {(token) => (
        <StudentLayout
          title="Pilih Level"
          backHref={`/student/learn/${chapterId}`}
        >
          <SubchapterContent token={token} subchapterId={subchapterId} router={router} />
        </StudentLayout>
      )}
    </StudentGate>
  );
}

function SubchapterContent({ token, subchapterId, router }: { token: string; subchapterId: string; router: ReturnType<typeof useRouter> }) {
  const query = useQuery({
    queryKey: ['subchapter', subchapterId],
    queryFn: () => learningApi.subchapter(token, subchapterId),
  });

  const startMutation = useMutation({
    mutationFn: (levelId: string) => learningApi.start(token, levelId),
    onSuccess: (attempt) => router.push(`/student/drill/${attempt.id}`),
  });

  if (query.isPending) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ height: 120, background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-danger)' }}>Gagal memuat data</p>
        <button onClick={() => void query.refetch()}>Coba Lagi</button>
      </div>
    );
  }

  if (!query.data.levels.length) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-lg)' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>🎯</span>
        <p>Belum ada level pada subbab ini.</p>
      </div>
    );
  }

  const sortedLevels = [...query.data.levels].sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Subchapter Title */}
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        {query.data.subchapter.title}
      </p>

      {/* Level Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {sortedLevels.map((level, index) => {
          const isLocked = level.status === 'locked';
          const isCompleted = level.status === 'completed';
          const isInProgress = level.status === 'inProgress';

          return (
            <div
              key={level.id}
              style={{
                padding: 'var(--space-4)',
                background: isLocked ? 'var(--color-surface)' : 'var(--color-surface-raised)',
                border: `1px solid ${isLocked ? 'var(--color-border-light)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              {/* Level Number */}
              <div style={{
                width: 48,
                height: 48,
                margin: '0 auto var(--space-3)',
                display: 'grid',
                placeItems: 'center',
                background: isLocked ? 'var(--color-border-light)' : isCompleted ? 'var(--color-success-light)' : 'var(--color-primary-light)',
                borderRadius: '50%',
                fontSize: 20,
                fontWeight: 800,
                color: isLocked ? 'var(--color-text-muted)' : isCompleted ? 'var(--color-success)' : 'var(--color-primary)',
              }}>
                {isLocked ? '🔒' : index + 1}
              </div>

              {/* Level Title */}
              <p style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: '0 0 var(--space-1)',
              }}>
                {level.title}
              </p>

              {/* Score if available */}
              {level.latestScore !== null && (
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}>
                  Nilai: {level.latestScore}
                </p>
              )}

              {/* Action Button */}
              {!isLocked && (
                <button
                  onClick={() => startMutation.mutate(level.id)}
                  disabled={startMutation.isPending}
                  style={{
                    marginTop: 'var(--space-3)',
                    width: '100%',
                    padding: 'var(--space-2)',
                    background: isInProgress ? 'var(--color-info)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    cursor: startMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: startMutation.isPending ? 0.7 : 1,
                  }}
                >
                  {isInProgress ? 'Lanjutkan' : isCompleted ? 'Ulangi' : 'Mulai'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {startMutation.isError && (
        <p style={{ color: 'var(--color-danger)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
          {startMutation.error.message}
        </p>
      )}
    </div>
  );
}
