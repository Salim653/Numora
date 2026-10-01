'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/onboarding/auth';
import { StudentLayout } from '@/components/shell';
import { joinClass } from '@/lib/api';

/* ============================================
 * STUDENT PROFILE PAGE
 * Modern profile with stats and settings
 * ============================================ */

export function ProfileScreen() {
  return (
    <ProfileGate>
      {(token, profile) => (
        <StudentLayout title="Profil">
          <ProfileContent token={token} profile={profile} />
        </StudentLayout>
      )}
    </ProfileGate>
  );
}

function ProfileGate({ children }: { children: (token: string, profile: { displayName: string; studentAffiliation: string; email?: string }) => React.ReactNode }) {
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
    const emailValue = state.session?.user?.email;
    const profile: { displayName: string; studentAffiliation: 'MANDIRI' | 'SCHOOL'; email: string } = {
      displayName: state.profile.displayName,
      studentAffiliation: (state.profile.studentAffiliation as 'MANDIRI' | 'SCHOOL') || 'MANDIRI',
      email: emailValue ?? '',
    };
    return children(state.session.access_token, profile);
  }

  return (
    <StudentLayout title="Akses Ditolak">
      <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <p>Halaman ini hanya untuk siswa.</p>
      </div>
    </StudentLayout>
  );
}

function ProfileContent({ token, profile }: { token: string; profile: { displayName: string; studentAffiliation: string; email?: string } }) {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const router = useRouter();

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [joining, setJoining] = useState(false);

  const isSchool = profile.studentAffiliation === 'SCHOOL';

  async function handleJoinClass(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoining(true);
    setJoinError('');
    setJoinSuccess('');

    try {
      await joinClass(token, joinCode.trim());
      setJoinSuccess('Berhasil bergabung dengan kelas!');
      setJoinCode('');
      await queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Gagal bergabung');
    } finally {
      setJoining(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.replace('/');
    } catch {
      // Handle error silently
    }
  }

  // Get initials for avatar
  const initials = profile.displayName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div>
      {/* Profile Header Card */}
      <div style={{
        padding: 'var(--space-6)',
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        {/* Avatar */}
        <div style={{
          width: 96,
          height: 96,
          margin: '0 auto var(--space-4)',
          borderRadius: '50%',
          background: 'var(--color-secondary)',
          color: 'white',
          display: 'grid',
          placeItems: 'center',
          fontSize: 36,
          fontWeight: 800,
        }}>
          {initials}
        </div>

        {/* Name */}
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 800,
          color: 'var(--color-text)',
          margin: '0 0 var(--space-2)',
        }}>
          {profile.displayName}
        </h2>

        {/* Email */}
        {profile.email && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}>
            {profile.email}
          </p>
        )}

        {/* Status Badge */}
        <div style={{ marginTop: 'var(--space-3)' }}>
          {isSchool ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-success)',
              background: 'var(--color-success-light)',
              borderRadius: 'var(--radius-full)',
            }}>
              ✅ User Sekolah
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 16px',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-info)',
              background: 'var(--color-info-light)',
              borderRadius: 'var(--radius-full)',
            }}>
              🌟 User Mandiri
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)',
      }}>
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>—</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>XP</p>
        </div>
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--numora-gold)', margin: 0 }}>—</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Streak</p>
        </div>
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success)', margin: 0 }}>—</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Level</p>
        </div>
      </div>

      {/* Join Class Section (for Mandiri users) */}
      {!isSchool && (
        <div style={{
          padding: 'var(--space-5)',
          background: 'var(--color-info-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: 24 }}>📚</span>
            <div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Bergabung dengan Sekolah
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
                Dapatkan akses TryOut dan Leaderboard kelas
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinClass}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Masukkan kode kelas"
                style={{
                  flex: 1,
                  padding: 'var(--space-3)',
                  fontSize: 'var(--text-base)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                }}
              />
              <button
                type="submit"
                disabled={joining || !joinCode.trim()}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: joining ? 'not-allowed' : 'pointer',
                  opacity: joining ? 0.7 : 1,
                }}
              >
                {joining ? '...' : 'Gabung'}
              </button>
            </div>
          </form>

          {joinError && (
            <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
              {joinError}
            </p>
          )}
          {joinSuccess && (
            <p style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
              {joinSuccess}
            </p>
          )}
        </div>
      )}

      {/* Settings Menu */}
      <div style={{
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: 'var(--space-6)',
      }}>
        <SettingsRow icon="📊" label="Riwayat Aktivitas" href="/student/assessment" />
        <SettingsDivider />
        <SettingsRow icon="🏆" label="Leaderboard" href="/demo/leaderboards" />
        <SettingsDivider />
        <SettingsRow icon="⚔️" label="PvP" href="/demo/pvp" />
      </div>

      {/* About & Help */}
      <div style={{
        background: 'var(--color-surface-raised)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        marginBottom: 'var(--space-6)',
      }}>
        <SettingsRow icon="ℹ️" label="Tentang NUMORA" onClick={() => {}} />
        <SettingsDivider />
        <SettingsRow icon="❓" label="Bantuan" onClick={() => {}} />
        <SettingsDivider />
        <SettingsRow icon="📜" label="Kebijakan Privasi" onClick={() => {}} />
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: 'var(--space-4)',
          background: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--text-base)',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
        }}
      >
        🚪 Keluar
      </button>

      {/* Version */}
      <p style={{
        textAlign: 'center',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        marginTop: 'var(--space-6)',
      }}>
        NUMORA v1.0.0
      </p>
    </div>
  );
}

/* ============================================
 * SETTINGS ROW COMPONENT
 * ============================================ */

function SettingsRow({
  icon,
  label,
  description,
  href,
  onClick
}: {
  icon: string;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-4)',
      cursor: 'pointer',
      transition: 'background var(--transition-fast)',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {content}
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{ outline: 'none' }}
    >
      {content}
    </div>
  );
}

function SettingsDivider() {
  return <div style={{ height: 1, background: 'var(--color-border-light)', margin: '0 var(--space-4)' }} />;
}

// Import useRouter
import { useRouter } from 'next/navigation';
