'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/onboarding/auth';
import { learningApi } from '@/features/core-learning/api';
import {
  StudentShell,
  GreetingSection,
  SectionHeader,
  FeatureGrid,
  ProgressCard,
  StatCard,
  EmptyState,
  SkeletonCard,
  Skeleton,
  type FeatureItem,
} from '@/components/shell';

/* ============================================
 * NEW STUDENT DASHBOARD
 * Modern home screen inspired by reference screenshots
 * ============================================ */

export function NewStudentDashboard() {
  return (
    <StudentDashboardGate>
      {(token, profile) => (
        <StudentShell
          userName={profile.displayName.split(' ')[0] || 'User'}
          userXp={0}
          userAffiliation={profile.studentAffiliation === 'SCHOOL' ? 'SEKOLAH' : 'MANDIRI'}
        >
          <DashboardContent token={token} profile={profile} />
        </StudentShell>
      )}
    </StudentDashboardGate>
  );
}

function StudentDashboardGate({ children }: { children: (token: string, profile: { displayName: string; studentAffiliation: string }) => React.ReactNode }) {
  const { state, refresh } = useAuth();
  const router = useRouter();

  // Handle all non-ready states first
  if (state.status !== 'ready') {
    if (state.status === 'signed_out') {
      router.replace('/');
      return null;
    }
    if (state.status === 'registration') {
      router.replace('/onboarding');
      return null;
    }
    if (state.status === 'error') {
      return (
        <StudentShell userName="...">
          <EmptyState
            icon="⚠️"
            title="Gagal memuat"
            description={state.message || 'Terjadi kesalahan saat memuat data.'}
            action={<button onClick={() => void refresh()}>Coba Lagi</button>}
          />
        </StudentShell>
      );
    }
    // loading, disabled states
    return (
      <StudentShell userName="...">
        <DashboardSkeleton />
      </StudentShell>
    );
  }

  // At this point, state.status === 'ready' and we have access to session and profile
  if (state.profile.role !== 'STUDENT') {
    router.replace('/');
    return null;
  }

  const token = state.session.access_token;
  const profile = {
    displayName: state.profile.displayName,
    studentAffiliation: state.profile.studentAffiliation || 'MANDIRI',
  };

  return children(token, profile);
}

function DashboardContent({ token, profile }: { token: string; profile: { displayName: string; studentAffiliation: string } }) {
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['student-progress'],
    queryFn: () => learningApi.progress(token),
    staleTime: 30000,
  });

  // Feature shortcuts - based on PRD, Mandiri can access Drill and PVP
  const featureItems: FeatureItem[] = [
    { label: 'Drill', icon: '🎯', href: '/student/learn' },
    { label: 'TryOut', icon: '📋', href: '/student/tryout', disabled: profile.studentAffiliation !== 'SCHOOL' },
    { label: 'Riwayat', icon: '📊', href: '/student/assessment' },
    { label: 'PVP', icon: '⚔️', href: '/demo/pvp' },
    { label: 'Ranking', icon: '🏆', href: '/demo/leaderboards' },
    { label: 'Profil', icon: '👤', href: '/student/profile' },
  ];

  return (
    <div>
      {/* Greeting */}
      <GreetingSection
        name={profile.displayName.split(' ')[0] ?? profile.displayName}
        affiliation={profile.studentAffiliation === 'SCHOOL' ? 'SEKOLAH' : 'MANDIRI'}
      />

      {/* Progress Card */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        {progressLoading ? (
          <SkeletonCard />
        ) : progress ? (
          <ProgressCard
            title="Progress Latihan"
            current={progress.completedLevels}
            total={progress.totalLevels}
            label={`${progress.completedLevels} dari ${progress.totalLevels} level`}
            href="/student/learn"
          />
        ) : (
          <ProgressCard
            title="Progress Latihan"
            current={0}
            total={20}
            label="Mulai drill pertamamu"
            href="/student/learn"
          />
        )}
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)'
      }}>
        <StatCard icon="⭐" value={progress?.completedLevels || 0} label="Level" />
        <StatCard icon="🎯" value={progress?.latestScore ?? '-'} label="Nilai Terakhir" />
        <StatCard icon="🔥" value="-" label="Streak" variant="gold" />
      </div>

      {/* Feature Shortcuts */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <SectionHeader title="Menu Utama" />
        <FeatureGrid items={featureItems} columns={3} />
      </div>

      {/* Quick Action CTA */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <SectionHeader title="Mulai Belajar" />
        <Link
          href="/student/learn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-6)',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          <span style={{ fontSize: 32 }}>🎯</span>
          <div style={{ textAlign: 'left' }}>
            <p style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-bold)',
              margin: 0,
            }}>
              Mulai Drill
            </p>
            <p style={{
              fontSize: 'var(--text-sm)',
              opacity: 0.9,
              margin: 'var(--space-1) 0 0 0',
            }}>
              Pilih bab dan level untuk latihan
            </p>
          </div>
          <span style={{ fontSize: 24, marginLeft: 'auto' }}>→</span>
        </Link>
      </div>

      {/* Latest Score Summary */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <SectionHeader title="Nilai Drill Terakhir" />
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          {progress?.latestScore !== null ? (
            <div>
              <span style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-extrabold)',
                color: 'var(--color-primary)',
              }}>
                {progress?.latestScore}
              </span>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                margin: 'var(--space-1) 0 0 0',
              }}>
                dari 100 poin
              </p>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 'var(--space-2)' }}>📝</span>
              <p style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)',
                margin: 0,
              }}>
                Belum ada Drill
              </p>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                margin: 'var(--space-1) 0 0 0',
              }}>
                Mulai drill untuk melihat nilai
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Join Class Banner (for Mandiri users) */}
      {profile.studentAffiliation !== 'SCHOOL' && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-info-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 24 }}>📚</span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text)',
                margin: 0,
              }}>
                Bergabung dengan Sekolah
              </p>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                margin: 'var(--space-1) 0 0 0',
              }}>
                Gabung kelas untuk akses TryOut dan Leaderboard
              </p>
            </div>
            <Link
              href="/student/profile"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
                textDecoration: 'none',
              }}
            >
              Gabung
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      {/* Greeting skeleton */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Skeleton width="70%" height={36} />
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Skeleton width={120} height={24} />
        </div>
      </div>

      {/* Progress skeleton */}
      <SkeletonCard />

      {/* Stats skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        <Skeleton height={80} />
        <Skeleton height={80} />
        <Skeleton height={80} />
      </div>

      {/* Feature grid skeleton */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Skeleton width={80} height={24} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-4)'
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} height={100} />
          ))}
        </div>
      </div>
    </div>
  );
}
