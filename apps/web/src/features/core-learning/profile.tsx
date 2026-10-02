'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Icon, Input, SectionHeader } from '@tka/ui';
import { useAuth } from '@/features/onboarding/auth';
import { StudentLayout } from '@/components/shell';
import { joinClass } from '@/lib/api';
import { StudentGate } from './ui';

export function ProfileScreen() {
  return (
    <StudentLayout title="Profil & akun" subtitle="Ruang untuk mengenal akun dan status belajarmu.">
      <StudentGate>{(token) => <ProfileContent token={token} />}</StudentGate>
    </StudentLayout>
  );
}

function ProfileContent({ token }: { token: string }) {
  const { state, logout, refresh } = useAuth();
  const router = useRouter();
  const cache = useQueryClient();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  if (state.status !== 'ready') return null;
  const profile = state.profile;
  const school = profile.studentAffiliation === 'SCHOOL';

  async function join(event: FormEvent) {
    event.preventDefault();
    if (!joinCode.trim() || busy) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await joinClass(token, joinCode.trim());
      setSuccess('Berhasil bergabung dengan kelas.');
      setJoinCode('');
      await cache.invalidateQueries();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Belum dapat bergabung. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    setError('');
    try {
      await logout();
      router.replace('/');
    } catch {
      setError('Belum dapat keluar. Coba lagi.');
      setBusy(false);
    }
  }
  return (
    <div className="profile-layout">
      <section className="profile-identity">
        <div className="profile-cover" aria-hidden="true">
          <span>÷</span>
          <span>✦</span>
          <span>π</span>
        </div>
        <div className="profile-avatar">
          {profile.displayName
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <h2>{profile.displayName}</h2>
        <p>{profile.email}</p>
        <Badge variant="secondary">
          <Icon name={school ? 'school' : 'user'} width={16} height={16} />
          {school ? 'Siswa sekolah' : 'Siswa mandiri'}
        </Badge>
        <p className="profile-motto">Setiap langkah belajar punya arti.</p>
      </section>
      <div className="stack">
        <section>
          <SectionHeader title="Informasi akun" />
          <div className="settings-list">
            <div className="settings-row">
              <span className="icon-tile accent-0">
                <Icon name="user" />
              </span>
              <div>
                <small>Nama</small>
                <strong>{profile.displayName}</strong>
              </div>
            </div>
            <div className="settings-row">
              <span className="icon-tile accent-3">
                <Icon name="mail" />
              </span>
              <div>
                <small>Email akun</small>
                <strong>{profile.email}</strong>
              </div>
              <Badge>Google</Badge>
            </div>
            <div className="settings-row">
              <span className="icon-tile accent-1">
                <Icon name="school" />
              </span>
              <div>
                <small>Status belajar</small>
                <strong>{school ? 'Terhubung dengan kelas' : 'Belajar mandiri'}</strong>
                <p>
                  {school
                    ? 'Kamu sudah menjadi bagian dari satu kelas.'
                    : 'Gunakan kode dari guru untuk bergabung dengan kelas.'}
                </p>
              </div>
            </div>
          </div>
        </section>
        {!school && (
          <section className="surface-card">
            <SectionHeader
              title="Gabung kelas"
              subtitle="Masukkan kode kelas yang diberikan oleh gurumu."
            />
            <form className="inline-form" onSubmit={join}>
              <Input
                label="Kode kelas"
                minLength={6}
                maxLength={32}
                pattern="(?:[A-Za-z0-9]{6}|[A-Za-z0-9_\x2D]{8,32})"
                autoCapitalize="characters"
                spellCheck={false}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.trim())}
                placeholder="Kode dari guru"
                required
                autoComplete="off"
              />
              <Button type="submit" disabled={busy || !joinCode.trim()}>
                {busy ? 'Menghubungkan…' : 'Gabung kelas'}
              </Button>
            </form>
          </section>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="success-message">
            {success}
          </p>
        )}
        <section>
          <SectionHeader title="Aktivitas belajar" />
          <div className="settings-list">
            <Link className="settings-row" href="/student/assessment">
              <span className="icon-tile accent-2">
                <Icon name="chart" />
              </span>
              <div>
                <strong>Progres & riwayat</strong>
                <p>Lihat perjalanan dan hasil latihanmu.</p>
              </div>
              <Icon name="chevron" />
            </Link>
            <Link className="settings-row" href="/student/learn">
              <span className="icon-tile accent-0">
                <Icon name="book" />
              </span>
              <div>
                <strong>Materi belajar</strong>
                <p>Jelajahi bab, subbab, dan level.</p>
              </div>
              <Icon name="chevron" />
            </Link>
          </div>
        </section>
        <Button variant="danger" onClick={() => void signOut()} disabled={busy}>
          <Icon name="logout" width={18} height={18} /> Keluar dari akun
        </Button>
      </div>
    </div>
  );
}
