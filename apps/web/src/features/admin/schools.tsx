'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@tka/ui';
import { useAuth } from '@/features/onboarding/auth';
import { AppShell } from '@/components/shell';
import {
  createSchool,
  issueTeacherToken,
  listAdminSchools,
  listTeacherTokens,
  reissueTeacherToken,
  revokeTeacherToken,
  updateSchool,
  type AdminSchool,
  type IssuedTeacherToken,
  type TeacherTokenSummary,
} from '@/lib/api';

export function AdminSchoolsScreen() {
  const { state } = useAuth();
  const accountKey = state.status === 'ready' ? state.profile.id : state.status;
  return <AdminSchoolsScreenContent key={accountKey} />;
}

function AdminSchoolsScreenContent() {
  const router = useRouter();
  const { state, refresh } = useAuth();
  const token =
    state.status === 'ready' && state.profile.role === 'ADMIN' ? state.session.access_token : null;
  const [schools, setSchools] = useState<AdminSchool[] | null>(null);
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState<TeacherTokenSummary[] | null>(null);
  const [issued, setIssued] = useState<IssuedTeacherToken | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (state.status === 'signed_out') router.replace('/');
    if (state.status === 'registration') router.replace('/onboarding');
    if (state.status === 'ready' && state.profile.role !== 'ADMIN')
      router.replace(state.profile.role === 'STUDENT' ? '/student' : '/teacher');
  }, [router, state]);
  useEffect(() => {
    if (!token) return;
    let active = true;
    listAdminSchools(token).then(
      (result) => {
        if (active) setSchools(result.items);
      },
      (cause: unknown) => {
        if (active) setError(message(cause));
      },
    );
    return () => {
      active = false;
    };
  }, [token, revision]);
  useEffect(() => {
    if (!token || !selected) return;
    let active = true;
    listTeacherTokens(token, selected).then(
      (result) => {
        if (active) setTokens(result.items);
      },
      (cause: unknown) => {
        if (active) setError(message(cause));
      },
    );
    return () => {
      active = false;
    };
  }, [token, selected, revision]);
  const current = schools?.find((school) => school.id === selected);
  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try {
      await action();
      setRevision((value) => value + 1);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  async function addSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    await run(async () => {
      const created = await createSchool(token, code.trim(), name.trim());
      setSelected(created.id);
      setCode('');
      setName('');
    });
  }
  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (token && current && editName.trim())
      await run(() => updateSchool(token, current.id, { name: editName.trim() }));
  }
  if (!token)
    return (
      <AppShell area="admin">
        <p role="status">{state.status === 'error' ? state.message : 'Memeriksa akses Admin…'}</p>
        <Button onClick={() => void refresh()}>Periksa lagi</Button>
      </AppShell>
    );
  return (
    <AppShell area="admin">
      <div className="monitoring-frame">
        <div className="monitoring-heading">
          <span className="eyebrow">Operasional sekolah</span>
          <h1>Sekolah dan token Guru</h1>
          <p>
            Kelola sekolah serta token verifikasi yang berlaku 3×24 jam dan hanya dapat dipakai
            sekali.
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {schools === null ? (
          <p role="status">Memuat sekolah…</p>
        ) : (
          <>
            <form
              className="monitoring-notice monitoring-create"
              onSubmit={(event) => void addSchool(event)}
            >
              <h2>Tambah sekolah</h2>
              <label htmlFor="school-code">Kode sekolah</label>
              <input
                className="text-input"
                id="school-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                minLength={2}
                maxLength={32}
                pattern="[a-zA-Z0-9-]+"
                required
              />
              <label htmlFor="school-name">Nama sekolah</label>
              <input
                className="text-input"
                id="school-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                required
              />
              <Button className="primary-button" type="submit" disabled={busy}>
                Simpan sekolah
              </Button>
            </form>
            {schools.length === 0 && <p className="monitoring-notice">Belum ada sekolah.</p>}
            <ul className="monitoring-list">
              {schools.map((school) => (
                <li key={school.id}>
                  <button
                    className="monitoring-row"
                    type="button"
                    onClick={() => {
                      setSelected(school.id);
                      setEditName(school.name);
                      setIssued(null);
                      setTokens(null);
                    }}
                  >
                    <span>
                      <strong>{school.name}</strong>
                      <small>
                        {school.code} · {school.status}
                      </small>
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {current && (
          <section className="monitoring-notice monitoring-admin-detail">
            <h2>{current.name}</h2>
            <p>Status: {current.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}</p>
            <form onSubmit={(event) => void saveName(event)}>
              <label htmlFor="edit-school-name">Ubah nama</label>
              <input
                className="text-input"
                id="edit-school-name"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                maxLength={120}
                required
              />
              <Button className="secondary-button" type="submit" disabled={busy}>
                Simpan nama
              </Button>
            </form>
            <Button
              className="secondary-button"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  updateSchool(token, current.id, {
                    status: current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                  }),
                )
              }
            >
              {current.status === 'ACTIVE' ? 'Nonaktifkan sekolah' : 'Aktifkan sekolah'}
            </Button>
            <h3>Token Guru</h3>
            <Button
              className="primary-button"
              disabled={busy || current.status !== 'ACTIVE'}
              onClick={() =>
                void run(async () => setIssued(await issueTeacherToken(token, current.id)))
              }
            >
              Terbitkan token
            </Button>
            {issued && (
              <p className="monitoring-token" role="status">
                Token baru (ditampilkan hanya kali ini): <code>{issued.token}</code>. Berlaku sampai{' '}
                {new Date(issued.expiresAt).toLocaleString('id-ID')}.
              </p>
            )}
            {tokens === null ? (
              <p role="status">Memuat token…</p>
            ) : tokens.length === 0 ? (
              <p>Belum ada token.</p>
            ) : (
              <ul className="monitoring-list">
                {tokens.map((item) => (
                  <li className="monitoring-row" key={item.id}>
                    <span>
                      <strong>{item.id}</strong>
                      <small>
                        {item.usedAt
                          ? 'Terpakai'
                          : item.revokedAt
                            ? 'Dicabut'
                            : new Date(item.expiresAt) <= new Date()
                              ? 'Kedaluwarsa'
                              : 'Belum dipakai'}
                      </small>
                      <small>Kedaluwarsa {new Date(item.expiresAt).toLocaleString('id-ID')}</small>
                    </span>
                    {!item.usedAt && !item.revokedAt && (
                      <span className="monitoring-token-actions">
                        <Button
                          className="secondary-button"
                          disabled={busy}
                          onClick={() =>
                            void run(async () =>
                              setIssued(await reissueTeacherToken(token, current.id, item.id)),
                            )
                          }
                        >
                          Terbit ulang
                        </Button>
                        <Button
                          className="secondary-button"
                          disabled={busy}
                          onClick={() =>
                            void run(async () => {
                              await revokeTeacherToken(token, current.id, item.id);
                              setIssued(null);
                            })
                          }
                        >
                          Cabut
                        </Button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

function message(cause: unknown) {
  return cause instanceof Error ? cause.message : 'Permintaan belum berhasil. Coba lagi.';
}
