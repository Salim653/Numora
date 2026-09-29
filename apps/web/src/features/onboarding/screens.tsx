'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@tka/ui';
import { destination, useAuth } from './auth';
import { getSupabase } from '@/lib/supabase';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="onboarding-shell">
      <div className="onboarding-frame">
        <header className="brand">NUMORA</header>
        {children}
        <p className="page-footer">Belajar matematika, satu langkah setiap hari.</p>
      </div>
    </main>
  );
}

function Notice({ title, message, retry }: { title: string; message: string; retry?: () => void }) {
  return (
    <section className="status-panel" role="status">
      <h2>{title}</h2>
      <p>{message}</p>
      {retry && (
        <Button className="secondary-button" onClick={retry}>
          Coba lagi
        </Button>
      )}
    </section>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button
        className="secondary-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError('');
          try {
            await logout();
            router.replace('/');
          } catch {
            setError('Belum dapat keluar. Coba lagi.');
            setBusy(false);
          }
        }}
      >
        {busy ? 'Sedang keluar…' : 'Keluar'}
      </Button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function Avatar({ name, photo }: { name: string; photo: unknown }) {
  const [failed, setFailed] = useState(false);
  let source = '';
  if (typeof photo === 'string') {
    try {
      const url = new URL(photo);
      if (
        url.protocol === 'https:' &&
        (url.hostname === 'googleusercontent.com' ||
          url.hostname.endsWith('.googleusercontent.com'))
      )
        source = photo;
    } catch {
      /* Use initials. */
    }
  }
  return (
    <span className="avatar" aria-hidden="true">
      {source && !failed ? (
        <img src={source} alt="" onError={() => setFailed(true)} />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const { state, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (state.status === 'ready') router.replace(destination(state.profile));
    if (state.status === 'registration') router.replace('/onboarding');
  }, [router, state]);
  const login = async () => {
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Login belum berhasil. Coba lagi.');
      setBusy(false);
    }
  };
  return (
    <Shell>
      <div className="login-layout">
        <section className="intro">
          <span className="eyebrow">Selamat datang</span>
          <h1>
            Matematika jadi lebih <em>terarah.</em>
          </h1>
          <p>Masuk untuk melanjutkan perjalanan belajar atau mendampingi siswa di NUMORA.</p>
          <div className="intro-art" aria-hidden="true">
            <span>∑</span>
            <span>π</span>
            <span>÷</span>
          </div>
        </section>
        <section className="panel login-panel" aria-label="Login NUMORA">
          <div className="panel-icon" aria-hidden="true">
            ✦
          </div>
          <h2>Mulai bersama NUMORA</h2>
          <p>Gunakan akun Google untuk masuk sebagai Siswa atau Guru.</p>
          {state.status === 'loading' ||
          state.status === 'ready' ||
          state.status === 'registration' ? (
            <p className="inline-status" role="status">
              Memeriksa sesi…
            </p>
          ) : state.status === 'disabled' ? (
            <>
              <p className="form-error" role="alert">
                Akun ini tidak aktif.
              </p>
              <LogoutButton />
            </>
          ) : (
            <>
              {state.status === 'error' && (
                <p className="form-error" role="alert">
                  {state.message}
                </p>
              )}
              {state.status === 'signed_out' && state.message && (
                <p className="form-error" role="alert">
                  {state.message}
                </p>
              )}
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <Button
                className="primary-button"
                disabled={busy || state.status === 'error'}
                onClick={login}
              >
                {busy ? 'Menghubungkan ke Google…' : 'Lanjutkan dengan Google'}
              </Button>
              {state.status === 'error' && (
                <Button className="text-button" onClick={() => void refresh()}>
                  Periksa lagi
                </Button>
              )}
            </>
          )}
          <p className="helper">Role dipilih sekali setelah login pertama.</p>
        </section>
      </div>
    </Shell>
  );
}

export function CallbackScreen() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code || params.has('error')) {
      setError('Login Google dibatalkan atau tidak berhasil.');
      return;
    }
    void (async () => {
      try {
        const { error: authError } = await getSupabase().auth.exchangeCodeForSession(code);
        if (authError) throw authError;
        router.replace('/');
      } catch {
        setError('Sesi login belum dapat dibuat. Coba masuk lagi.');
      }
    })();
  }, [router]);
  return (
    <Shell>
      {error ? (
        <Notice title="Login belum berhasil" message={error} retry={() => router.replace('/')} />
      ) : (
        <Notice title="Menyelesaikan login" message="Sebentar, kami sedang memeriksa akunmu." />
      )}
    </Shell>
  );
}

function RegistrationForm({ initialName, email }: { initialName: string; email: string }) {
  const { register } = useAuth();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | ''>('');
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!role || !name.trim()) {
      setError('Pilih role dan isi nama tampilan.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await register(role, name.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Profil belum tersimpan. Coba lagi.');
      setBusy(false);
    }
  };
  return (
    <form onSubmit={(event) => void submit(event)}>
      <fieldset className="role-fieldset">
        <legend>Saya masuk sebagai</legend>
        <div className="role-options">
          <label className={`role-option ${role === 'STUDENT' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value="STUDENT"
              checked={role === 'STUDENT'}
              onChange={() => setRole('STUDENT')}
            />
            <strong>Siswa</strong>
            <span>Belajar dan melihat progres sendiri</span>
          </label>
          <label className={`role-option ${role === 'TEACHER' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value="TEACHER"
              checked={role === 'TEACHER'}
              onChange={() => setRole('TEACHER')}
            />
            <strong>Guru</strong>
            <span>Mendampingi siswa setelah verifikasi sekolah</span>
          </label>
        </div>
      </fieldset>
      <label className="field-label" htmlFor="display-name">
        Nama tampilan
      </label>
      <input
        className="text-input"
        id="display-name"
        name="displayName"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={80}
        required
      />
      <p className="field-help">Email Google: {email}</p>
      <p className="field-help">Role tidak dapat diubah sendiri setelah profil disimpan.</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button className="primary-button" type="submit" disabled={busy}>
        {busy ? 'Menyimpan profil…' : 'Simpan dan lanjutkan'}
      </Button>
    </form>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const { state, refresh } = useAuth();
  useEffect(() => {
    if (state.status === 'ready') router.replace(destination(state.profile));
    if (state.status === 'signed_out') router.replace('/');
  }, [router, state]);
  return (
    <Shell>
      <section className="panel form-panel">
        <span className="eyebrow">Langkah pertama</span>
        <h1>Lengkapi profilmu</h1>
        <p>Pilih cara kamu menggunakan NUMORA dan periksa nama yang akan ditampilkan.</p>
        {state.status === 'registration' && state.session ? (
          <>
            <RegistrationForm
              initialName={String(
                state.session.user.user_metadata.full_name ??
                  state.session.user.user_metadata.name ??
                  '',
              )}
              email={state.session.user.email ?? ''}
            />
            <div className="form-logout">
              <LogoutButton />
            </div>
          </>
        ) : state.status === 'error' ? (
          <Notice
            title="Profil belum dapat diperiksa"
            message={state.message ?? 'Coba lagi.'}
            retry={() => void refresh()}
          />
        ) : state.status === 'disabled' ? (
          <>
            <p className="form-error" role="alert">
              Akun ini tidak aktif.
            </p>
            <LogoutButton />
          </>
        ) : (
          <p className="inline-status" role="status">
            Memeriksa sesi…
          </p>
        )}
      </section>
    </Shell>
  );
}

export function RoleHomeScreen({
  page,
}: {
  page: '/student' | '/teacher' | '/teacher/verification-required';
}) {
  const router = useRouter();
  const { state, refresh } = useAuth();
  useEffect(() => {
    if (state.status === 'signed_out') router.replace('/');
    if (state.status === 'registration') router.replace('/onboarding');
    if (state.status === 'ready' && destination(state.profile) !== page)
      router.replace(destination(state.profile));
  }, [router, state, page]);
  const authorized = state.status === 'ready' && destination(state.profile) === page;
  const title =
    page === '/student'
      ? 'Halo, selamat datang!'
      : page === '/teacher'
        ? 'Selamat datang, Guru!'
        : 'Verifikasi sekolah diperlukan';
  return (
    <Shell>
      <section className="panel home-panel">
        {authorized ? (
          <>
            <span className="eyebrow">
              {state.profile.role === 'STUDENT' ? 'Area Siswa' : 'Area Guru'}
            </span>
            <h1>{title}</h1>
            <p>
              {page === '/teacher/verification-required'
                ? 'Akun Guru sudah dibuat. Fitur Guru akan tersedia setelah verifikasi sekolah pada tahap berikutnya.'
                : 'Login berhasil. Halaman utama untuk role ini akan dikembangkan pada tahap berikutnya.'}
            </p>
            <div className="identity-card">
              <Avatar
                name={state.profile.displayName}
                photo={state.session.user.user_metadata.avatar_url}
              />
              <div>
                <strong>{state.profile.displayName}</strong>
                <small>{state.profile.email}</small>
              </div>
            </div>
            <LogoutButton />
          </>
        ) : state.status === 'error' ? (
          <Notice
            title="Akun belum dapat diperiksa"
            message={state.message ?? 'Coba lagi.'}
            retry={() => void refresh()}
          />
        ) : state.status === 'disabled' ? (
          <>
            <Notice title="Akun tidak aktif" message="Akses akun ini sedang tidak tersedia." />
            <LogoutButton />
          </>
        ) : (
          <p className="inline-status" role="status">
            Memeriksa akses…
          </p>
        )}
      </section>
    </Shell>
  );
}
