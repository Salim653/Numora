'use client';

import { Button } from '@tka/ui';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Profile = {
  id: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED';
  displayName: string;
  email: string;
  teacherVerified: boolean | null;
  studentAffiliation: 'MANDIRI' | 'SCHOOL' | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const primaryButton =
  'min-h-11 bg-[var(--numora-primary)] text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

export function AuthPanel() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'signed-out' | 'unregistered' | 'ready' | 'denied' | 'error'
  >('loading');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('authError')) {
      setMessage('Login Google belum selesai. Periksa pengaturan callback atau coba lagi.');
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus('error');
      setMessage('Konfigurasi Supabase Cloud belum tersedia.');
      return;
    }
    setClient(supabase);
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus('error');
        setMessage('Sesi tidak dapat dibaca. Coba muat ulang halaman.');
      } else {
        setToken(data.session?.access_token ?? null);
        if (!data.session) setStatus('signed-out');
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
      if (!session) {
        setProfile(null);
        setStatus('signed-out');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setStatus('loading');
    void fetch(`${apiUrl}/identity/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 404) {
          setStatus('unregistered');
          return;
        }
        if (response.status === 403) {
          setStatus('denied');
          return;
        }
        if (!response.ok) throw new Error('Profil tidak dapat dimuat.');
        setProfile((await response.json()) as Profile);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setStatus('error');
        setMessage('API tidak dapat dihubungi. Periksa koneksi lalu muat ulang halaman.');
      });
    return () => controller.abort();
  }, [token]);

  async function signIn() {
    if (!client) return;
    setBusy(true);
    setMessage('');
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage('Login Google gagal dimulai. Coba lagi.');
      setBusy(false);
    }
  }

  async function signOut() {
    if (!client) return;
    setBusy(true);
    const { error } = await client.auth.signOut();
    setBusy(false);
    if (error) setMessage('Logout gagal. Coba lagi.');
  }

  async function register() {
    if (!token) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`${apiUrl}/identity/me`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error();
      setProfile((await response.json()) as Profile);
      setStatus('ready');
    } catch {
      setMessage(
        'Profil belum tersimpan. Coba lagi; jika akun sudah terdaftar, muat ulang halaman.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mt-8 rounded-3xl border border-purple-200 bg-[var(--numora-surface)] p-6"
      aria-labelledby="auth-title"
    >
      <h2 id="auth-title" className="text-xl font-bold text-slate-950">
        Akun NUMORA
      </h2>
      {status === 'loading' && (
        <p className="mt-3" role="status">
          Memeriksa sesi dan profil…
        </p>
      )}
      {status === 'signed-out' && (
        <div className="mt-4 space-y-4">
          <p>Masuk sebagai Siswa atau Guru menggunakan akun Google.</p>
          <Button className={primaryButton} disabled={busy} onClick={() => void signIn()}>
            {busy ? 'Menghubungkan…' : 'Masuk dengan Google'}
          </Button>
        </div>
      )}
      {status === 'unregistered' && (
        <div className="mt-4 space-y-4">
          <p>Pilih peran untuk membuat profil. Pilihan ini hanya dapat dilakukan sekali.</p>
          <fieldset className="space-y-2">
            <legend className="font-semibold">Peran akun</legend>
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="role"
                value="STUDENT"
                checked={role === 'STUDENT'}
                onChange={() => setRole('STUDENT')}
              />
              Siswa
            </label>
            <label className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="role"
                value="TEACHER"
                checked={role === 'TEACHER'}
                onChange={() => setRole('TEACHER')}
              />
              Guru
            </label>
          </fieldset>
          <Button className={primaryButton} disabled={busy} onClick={() => void register()}>
            {busy ? 'Menyimpan…' : 'Buat profil'}
          </Button>
        </div>
      )}
      {status === 'ready' && profile && (
        <div className="mt-4 space-y-3">
          <p>
            <strong>{profile.displayName}</strong> · {profile.email}
          </p>
          <p>
            Peran:{' '}
            {profile.role === 'STUDENT' ? 'Siswa' : profile.role === 'TEACHER' ? 'Guru' : 'Admin'}
          </p>
          {profile.role === 'STUDENT' && (
            <p>
              Status:{' '}
              {profile.studentAffiliation === 'SCHOOL' ? 'Terafiliasi Sekolah' : 'User Mandiri'}
            </p>
          )}
          {profile.role === 'TEACHER' && (
            <p>
              Status Guru:{' '}
              {profile.teacherVerified
                ? 'Terverifikasi'
                : 'Belum terverifikasi; fitur Guru terkunci.'}
            </p>
          )}
          <Button
            className="min-h-11 border border-purple-300 bg-white text-[var(--numora-primary)]"
            disabled={busy}
            onClick={() => void signOut()}
          >
            {busy ? 'Keluar…' : 'Keluar'}
          </Button>
        </div>
      )}
      {status === 'denied' && (
        <p className="mt-3">Akun ini dinonaktifkan. Hubungi administrator.</p>
      )}
      {status === 'error' && <p className="mt-3">{message}</p>}
      {status === 'error' && token && (
        <Button
          className="mt-3 min-h-11 border border-purple-300 bg-white text-[var(--numora-primary)]"
          onClick={() => window.location.reload()}
        >
          Coba lagi
        </Button>
      )}
      {(status === 'denied' || (status === 'error' && token)) && (
        <Button
          className="ml-3 mt-3 min-h-11 border border-purple-300 bg-white text-[var(--numora-primary)]"
          disabled={busy}
          onClick={() => void signOut()}
        >
          Keluar
        </Button>
      )}
      {message && status !== 'error' && (
        <p className="mt-3 text-red-700" role="alert">
          {message}
        </p>
      )}
    </section>
  );
}
