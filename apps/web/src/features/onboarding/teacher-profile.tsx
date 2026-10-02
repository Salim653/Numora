'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Icon, SectionHeader } from '@tka/ui';
import { TeacherShell } from '@/components/shell';
import { TeacherGate } from '@/features/monitoring/teacher-screens';
import { useAuth } from './auth';

export function TeacherProfileScreen() {
  return <TeacherGate>{(_, name) => <TeacherProfileContent name={name} />}</TeacherGate>;
}

function TeacherProfileContent({ name }: { name: string }) {
  const { state, logout } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (state.status !== 'ready') return null;

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
    <TeacherShell title="Profil & akun" teacherName={name}>
      <div className="profile-layout">
        <section className="profile-identity">
          <div className="profile-cover" aria-hidden="true" />
          <div className="profile-avatar">{name.slice(0, 1).toUpperCase()}</div>
          <h2>{name}</h2>
          <p>{state.profile.email}</p>
          <Badge variant="secondary">
            <Icon name="school" width={16} height={16} /> Guru
          </Badge>
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
                  <strong>{name}</strong>
                </div>
              </div>
              <div className="settings-row">
                <span className="icon-tile accent-3">
                  <Icon name="mail" />
                </span>
                <div>
                  <small>Email akun</small>
                  <strong>{state.profile.email}</strong>
                </div>
                <Badge>Google</Badge>
              </div>
              <div className="settings-row">
                <span className="icon-tile accent-1">
                  <Icon name="school" />
                </span>
                <div>
                  <small>Verifikasi sekolah</small>
                  <strong>
                    {state.profile.teacherVerified ? 'Terverifikasi' : 'Belum terverifikasi'}
                  </strong>
                </div>
              </div>
            </div>
          </section>
          <section>
            <SectionHeader title="Akses cepat" />
            <div className="settings-list">
              <Link className="settings-row" href="/teacher">
                <span className="icon-tile accent-2">
                  <Icon name="users" />
                </span>
                <div>
                  <strong>Kelas saya</strong>
                  <p>Lihat kelas dan progres siswa.</p>
                </div>
                <Icon name="chevron" />
              </Link>
            </div>
          </section>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Button variant="danger" onClick={() => void signOut()} disabled={busy}>
            <Icon name="logout" width={18} height={18} />{' '}
            {busy ? 'Sedang keluar…' : 'Keluar dari akun'}
          </Button>
        </div>
      </div>
    </TeacherShell>
  );
}
