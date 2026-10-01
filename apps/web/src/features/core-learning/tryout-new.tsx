'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { learningApi, LearningApiError } from './api';
import type { TryoutAttempt } from './types';
import { AssessmentSession } from './assessment-session';
import { StudentLayout } from '@/components/shell';
import { useAuth } from '@/features/onboarding/auth';
import { LearningProvider } from './provider';
import { MathText } from './ui';

/* ============================================
 * TRYOUT SCREEN - Main tryout page
 * Using new StudentLayout shell
 * ============================================ */

export function TryoutScreen() {
  return (
    <StudentGate>
      {(token) => (
        <StudentLayout
          title="TryOut"
          subtitle="Simulasi mingguan untuk menguji pemahamanmu"
        >
          <CurrentTryout token={token} />
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

function CurrentTryout({ token }: { token: string }) {
  const router = useRouter();

  const query = useQuery({
    queryKey: ['current-tryout'],
    queryFn: () => learningApi.currentTryout(token),
  });

  const start = useMutation({
    mutationFn: (packageId: string) => learningApi.startTryout(token, packageId),
    onSuccess: (attempt) => router.push(`/student/tryout/${attempt.id}`),
  });

  if (query.isPending) {
    return (
      <div style={{
        padding: 'var(--space-6)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div style={{ width: 56, height: 56, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 20, background: 'var(--color-surface)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 14, background: 'var(--color-surface)', borderRadius: 4, width: '60%' }} />
          </div>
        </div>
        <div style={{ height: 44, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-4)' }}>⚠️</span>
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
          Gagal memuat data
        </p>
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

  const current = query.data;

  if (current.state === 'unavailable') {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-12)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 'var(--space-4)' }}>📋</span>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 var(--space-2) 0' }}>
          {current.eligible ? 'Paket Belum Tersedia' : 'Gabung Kelas untuk TryOut'}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
          {current.eligible
            ? 'TryOut belum diterbitkan. Konfigurasi resmi masih menunggu keputusan akademik.'
            : 'TryOut MVP hanya tersedia untuk siswa yang sudah bergabung ke kelas.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Package Info Card */}
      <div style={{
        padding: 'var(--space-5)',
        background: 'var(--color-primary-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--numora-purple-200)',
        marginBottom: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{
            width: 56,
            height: 56,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontSize: 28,
          }}>
            📋
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Paket Berjalan
            </p>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 800,
              color: 'var(--color-text)',
              margin: 'var(--space-1) 0 0 0',
            }}>
              {current.title}
            </h2>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              margin: 'var(--space-1) 0 0 0',
            }}>
              Dirilis {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(current.releaseAt))} WIB
              {current.questionCount && ` • ${current.questionCount} soal`}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        marginBottom: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
              Informasi TryOut
            </p>
            <ul style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 0 0', paddingLeft: 'var(--space-4)' }}>
              <li>Paket baru dirilis Senin 00.00 WIB</li>
              <li>Satu kali attempt per paket</li>
              <li>Hasil tersedia setelah pemrosesan IRT</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Eligibility Warning */}
      {!current.eligible && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-warning-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-4)',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-warning)', margin: 0 }}>
            ⚠️ TryOut MVP hanya untuk siswa yang sudah bergabung ke kelas
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {current.eligible && current.state === 'open' && (
        <button
          onClick={() => start.mutate(current.id)}
          disabled={start.isPending}
          style={{
            width: '100%',
            padding: 'var(--space-4)',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            cursor: start.isPending ? 'not-allowed' : 'pointer',
            opacity: start.isPending ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <span>🎯</span>
          {start.isPending ? 'Memulai...' : 'Mulai TryOut'}
        </button>
      )}

      {current.state === 'inProgress' && current.attemptId && (
        <Link
          href={`/student/tryout/${current.attemptId}`}
          style={{
            display: 'block',
            width: '100%',
            padding: 'var(--space-4)',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Lanjutkan TryOut →
        </Link>
      )}

      {current.state === 'waitingIrt' && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-info-light)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-info)', margin: 0 }}>
            ⏳ Jawaban terkirim. Hasil menunggu batch IRT.
          </p>
        </div>
      )}

      {current.state === 'resultReady' && current.attemptId && (
        <Link
          href={`/student/tryout/${current.attemptId}/result`}
          style={{
            display: 'block',
            width: '100%',
            padding: 'var(--space-4)',
            background: 'var(--color-success)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Lihat Hasil Simulasi →
        </Link>
      )}

      {start.isError && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
          {start.error.message}
        </p>
      )}
    </div>
  );
}

/* ============================================
 * TRYOUT ATTEMPT SCREEN
 * ============================================ */

export function TryoutAttemptScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return (
    <StudentGate>
      {(token) => (
        <StudentLayout
          title="Mengerjakan TryOut"
          hideBottomNav={true}
        >
          <AttemptData token={token} attemptId={attemptId} />
        </StudentLayout>
      )}
    </StudentGate>
  );
}

function AttemptData({ token, attemptId }: { token: string; attemptId: string }) {
  const query = useQuery({
    queryKey: ['tryout-attempt', attemptId],
    queryFn: () => learningApi.tryoutAttempt(token, attemptId),
  });

  if (query.isPending) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        Memuat...
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

  if (query.data.status === 'submitted') {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-12)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 'var(--space-4)' }}>✅</span>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>Jawaban Sudah Terkirim</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Hasil dan pembahasan menunggu batch IRT.{' '}
          <Link href="/student/tryout" style={{ color: 'var(--color-primary)' }}>
            Lihat status paket
          </Link>
        </p>
      </div>
    );
  }

  return <TryoutForm key={attemptId} attempt={query.data} token={token} />;
}

function TryoutForm({ attempt, token }: { attempt: TryoutAttempt; token: string }) {
  const router = useRouter();
  const deadline = attempt.deadlineAt
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(attempt.deadlineAt))
    : null;

  return (
    <AssessmentSession
      title={attempt.packageTitle}
      questions={attempt.questions}
      headerExtra={deadline ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Batas waktu: {deadline} WIB</span> : null}
      submitLabel="Kirim TryOut"
      confirmMessage={(emptyCount) =>
        `${emptyCount} soal belum dijawab. Kirim jawaban TryOut?`
      }
      onSave={(questionId, optionId) =>
        learningApi.saveTryoutAnswer(token, attempt.id, questionId, optionId)
      }
      onSubmit={() => learningApi.submitTryout(token, attempt.id)}
      onSubmitted={() => router.push('/student/tryout')}
    />
  );
}

/* ============================================
 * TRYOUT RESULT SCREEN
 * ============================================ */

export function TryoutResultScreen() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return (
    <StudentGate>
      {(token) => (
        <StudentLayout title="Hasil TryOut">
          <TryoutResultData token={token} attemptId={attemptId} />
        </StudentLayout>
      )}
    </StudentGate>
  );
}

function TryoutResultData({ token, attemptId }: { token: string; attemptId: string }) {
  const query = useQuery({
    queryKey: ['tryout-result', attemptId],
    queryFn: () => learningApi.tryoutResult(token, attemptId),
  });

  if (
    query.isError &&
    query.error instanceof LearningApiError &&
    query.error.code === 'TRYOUT_RESULT_PENDING'
  ) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-12)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <span style={{ fontSize: 64, display: 'block', marginBottom: 'var(--space-4)' }}>⏳</span>
        <h3 style={{ marginBottom: 'var(--space-2)' }}>Menunggu Hasil IRT</h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Nilai dan pembahasan belum dapat dibuka sampai batch IRT selesai.
        </p>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        Memuat...
      </div>
    );
  }

  if (query.isError) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ color: 'var(--color-danger)' }}>Gagal memuat hasil</p>
        <button onClick={() => void query.refetch()}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div>
      {/* Score Card */}
      <div style={{
        padding: 'var(--space-6)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <p style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-primary)',
          margin: 0,
        }}>
          {query.data.packageTitle}
        </p>
        <p style={{
          fontSize: '72px',
          fontWeight: 900,
          color: 'var(--color-primary)',
          margin: 'var(--space-4) 0',
          lineHeight: 1,
        }}>
          {query.data.score}
        </p>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}>
          {query.data.correctCount} dari {query.data.questionCount} benar
        </p>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-light)',
          margin: 'var(--space-2) 0 0 0',
        }}>
          Nilai ini bukan nilai TKA resmi
        </p>
      </div>

      {/* Explanations */}
      <h2 style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 700,
        color: 'var(--color-text)',
        marginBottom: 'var(--space-4)',
      }}>
        Pembahasan
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {query.data.explanation.map((item, index) => (
          <div
            key={item.questionInstanceId}
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <span style={{
                width: 28,
                height: 28,
                display: 'grid',
                placeItems: 'center',
                background: item.selectedOptionId === item.correctOptionId ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                color: item.selectedOptionId === item.correctOptionId ? 'var(--color-success)' : 'var(--color-danger)',
                borderRadius: '50%',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
              }}>
                {index + 1}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {item.selectedOptionId === item.correctOptionId ? '✓ Benar' : '✗ Salah'}
              </span>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              <MathText value={item.stem} />
            </p>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              Jawabanmu: {item.selectedOptionId || 'Tidak dijawab'}
              {item.selectedOptionId !== item.correctOptionId && ` • Jawaban benar: ${item.correctOptionId}`}
            </p>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
              <strong>Pembahasan:</strong> <MathText value={item.explanation} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
