'use client';

import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@tka/ui';
import { destination, useAuth } from '@/features/onboarding/auth';
import {
  ApiProblem,
  createTeacherClass,
  getClassStudents,
  getTeacherClasses,
  getTeacherStudentProgress,
  type ClassStudentsResponse,
  type ClassesResponse,
  type TeacherStudentProgress,
} from '@/lib/api';

function TeacherGate({
  children,
}: {
  children: (token: string, teacherName: string) => React.ReactNode;
}) {
  const { state, refresh, logout } = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => {
    if (state.status === 'signed_out') router.replace('/');
    if (state.status === 'registration') router.replace('/onboarding');
    if (state.status === 'ready' && destination(state.profile) !== '/teacher') {
      router.replace(destination(state.profile));
    }
  }, [router, state]);
  if (state.status === 'ready' && destination(state.profile) === '/teacher') {
    return (
      <Fragment key={state.profile.id}>
        {children(state.session.access_token, state.profile.displayName)}
      </Fragment>
    );
  }
  return (
    <main className="monitoring-shell">
      <div className="monitoring-frame">
        <header className="brand">NUMORA</header>
        {state.status === 'error' ? (
          <section className="monitoring-notice" role="alert">
            <h1>Akun belum dapat diperiksa</h1>
            <p>{state.message ?? 'Coba lagi.'}</p>
            <Button className="secondary-button" onClick={() => void refresh()}>
              Periksa lagi
            </Button>
          </section>
        ) : state.status === 'disabled' ? (
          <section className="monitoring-notice" role="alert">
            <h1>Akun tidak aktif</h1>
            <p>Akses akun ini sedang tidak tersedia.</p>
            <Button
              className="secondary-button"
              onClick={async () => {
                try {
                  setLogoutError('');
                  await logout();
                  router.replace('/');
                } catch {
                  setLogoutError('Belum dapat keluar. Coba lagi.');
                }
              }}
            >
              Keluar
            </Button>
            {logoutError && <p className="form-error">{logoutError}</p>}
          </section>
        ) : (
          <p className="inline-status" role="status">
            Memeriksa akses Guru…
          </p>
        )}
      </div>
    </main>
  );
}

function TeacherFrame({
  title,
  description,
  teacherName,
  children,
}: {
  title: string;
  description: string;
  teacherName: string;
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState('');
  return (
    <main className="monitoring-shell">
      <div className="monitoring-frame">
        <header className="monitoring-header">
          <Link className="brand" href="/teacher">
            NUMORA
          </Link>
          <Button
            className="secondary-button"
            onClick={async () => {
              setLogoutError('');
              try {
                await logout();
                router.replace('/');
              } catch {
                setLogoutError('Belum dapat keluar. Coba lagi.');
              }
            }}
          >
            Keluar
          </Button>
        </header>
        {logoutError && (
          <p className="form-error" role="alert">
            {logoutError}
          </p>
        )}
        <div className="monitoring-heading">
          <span className="eyebrow">Area Guru · {teacherName}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function DataState({ error, retry }: { error: ApiProblem | null; retry: () => void }) {
  if (!error)
    return (
      <p className="monitoring-notice" role="status">
        Memuat data…
      </p>
    );
  const forbidden = error.status === 403;
  const missing = error.status === 404;
  const expired = error.status === 401;
  return (
    <section className="monitoring-notice" role="alert">
      <h2>
        {forbidden
          ? 'Akses ditolak'
          : missing
            ? 'Data tidak ditemukan'
            : expired
              ? 'Sesi berakhir'
              : 'Data belum dapat dimuat'}
      </h2>
      <p>
        {forbidden || missing
          ? error.message
          : expired
            ? 'Periksa kembali sesi login.'
            : 'Periksa koneksi, lalu coba lagi.'}
      </p>
      {!forbidden && !missing && (
        <Button className="secondary-button" onClick={retry}>
          {expired ? 'Periksa sesi' : 'Coba lagi'}
        </Button>
      )}
    </section>
  );
}

function MyClassesContent({ token, teacherName }: { token: string; teacherName: string }) {
  const { refresh } = useAuth();
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<ClassesResponse | null>(null);
  const [error, setError] = useState<ApiProblem | null>(null);
  const [name, setName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const result = await createTeacherClass(token, name.trim());
      setCreatedCode(result.joinCode);
      setName('');
      setRevision((value) => value + 1);
    } catch (cause) {
      setCreateError(cause instanceof Error ? cause.message : 'Class belum dapat dibuat.');
    } finally {
      setCreating(false);
    }
  }
  useEffect(() => {
    let active = true;
    getTeacherClasses(token).then(
      (result) => {
        if (active) setData(result);
      },
      (cause: unknown) => {
        if (!active) return;
        const problem =
          cause instanceof ApiProblem ? cause : new ApiProblem(0, 'API_ERROR', 'Permintaan gagal.');
        setError(problem);
      },
    );
    return () => {
      active = false;
    };
  }, [token, revision, refresh]);
  return (
    <TeacherFrame
      title="Class saya"
      description="Pilih Class untuk melihat daftar Student."
      teacherName={teacherName}
    >
      <form className="monitoring-notice monitoring-create" onSubmit={(event) => void create(event)}>
        <h2>Buat Class</h2>
        <label htmlFor="class-name">Nama Class</label>
        <input
          className="text-input"
          id="class-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          placeholder="Contoh: IX A"
        />
        {createError && <p className="form-error" role="alert">{createError}</p>}
        <Button className="primary-button" type="submit" disabled={creating}>
          {creating ? 'Membuat…' : 'Buat Class'}
        </Button>
      </form>
      {createdCode && <p className="monitoring-notice" role="status">
        Class dibuat. Kode bergabung: <strong>{createdCode}</strong>. Bagikan kode ini kepada siswa.
      </p>}
      {data ? (
        data.items.length ? (
          <ul className="monitoring-list">
            {data.items.map((item) => (
              <li key={item.id}>
                <Link className="monitoring-row" href={`/teacher/classes/${item.id}`}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>Buka daftar Student</small>
                    {item.joinCode && <small>Kode bergabung: {item.joinCode}</small>}
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <section className="monitoring-notice">
            <h2>Belum ada Class</h2>
            <p>Class yang Anda kelola akan tampil di sini.</p>
          </section>
        )
      ) : (
        <DataState
          error={error}
          retry={
            error?.status === 401
              ? () => void refresh()
              : () => {
                  setError(null);
                  setRevision((value) => value + 1);
                }
          }
        />
      )}
    </TeacherFrame>
  );
}

export function MyClassesScreen() {
  return (
    <TeacherGate>
      {(token, name) => <MyClassesContent token={token} teacherName={name} />}
    </TeacherGate>
  );
}

function useClassStudents(token: string, classId: string) {
  const { refresh } = useAuth();
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<ClassStudentsResponse | null>(null);
  const [error, setError] = useState<ApiProblem | null>(null);
  useEffect(() => {
    let active = true;
    getClassStudents(token, classId).then(
      (result) => {
        if (active) setData(result);
      },
      (cause: unknown) => {
        if (!active) return;
        const problem =
          cause instanceof ApiProblem ? cause : new ApiProblem(0, 'API_ERROR', 'Permintaan gagal.');
        setError(problem);
      },
    );
    return () => {
      active = false;
    };
  }, [token, classId, revision, refresh]);
  return {
    data,
    error,
    retry:
      error?.status === 401
        ? () => void refresh()
        : () => {
            setError(null);
            setRevision((value) => value + 1);
          },
  };
}

function ClassStudentsContent({
  token,
  teacherName,
  classId,
}: {
  token: string;
  teacherName: string;
  classId: string;
}) {
  const { data, error, retry } = useClassStudents(token, classId);
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const students = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('id-ID');
    return (data?.items ?? [])
      .filter((student) => student.displayName.toLocaleLowerCase('id-ID').includes(term))
      .sort(
        (a, b) => (order === 'asc' ? 1 : -1) * a.displayName.localeCompare(b.displayName, 'id-ID'),
      );
  }, [data, query, order]);
  return (
    <TeacherFrame
      title={data?.class.name ?? 'Student Class'}
      description="Daftar Student yang saat ini bergabung di Class ini."
      teacherName={teacherName}
    >
      <Link className="monitoring-back" href="/teacher">
        ← Kembali ke Class saya
      </Link>
      {data ? (
        data.items.length ? (
          <>
            <div className="monitoring-controls">
              <label>
                Cari Student
                <input
                  className="text-input"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nama Student"
                />
              </label>
              <label>
                Urutkan nama
                <select
                  className="text-input"
                  value={order}
                  onChange={(event) => setOrder(event.target.value as 'asc' | 'desc')}
                >
                  <option value="asc">A–Z</option>
                  <option value="desc">Z–A</option>
                </select>
              </label>
            </div>
            {students.length ? (
              <ul className="monitoring-list">
                {students.map((student) => (
                  <li key={student.id}>
                    <Link
                      className="monitoring-row"
                      href={`/teacher/classes/${classId}/students/${student.id}`}
                    >
                      <span>
                        <strong>{student.displayName}</strong>
                        <small>Buka detail Student</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="monitoring-notice" role="status">
                Tidak ada Student yang cocok.
              </p>
            )}
          </>
        ) : (
          <section className="monitoring-notice">
            <h2>Belum ada Student</h2>
            <p>Student yang bergabung akan tampil di sini.</p>
          </section>
        )
      ) : (
        <DataState error={error} retry={retry} />
      )}
    </TeacherFrame>
  );
}

export function ClassStudentsScreen({ classId }: { classId: string }) {
  return (
    <TeacherGate key={classId}>
      {(token, name) => <ClassStudentsContent token={token} teacherName={name} classId={classId} />}
    </TeacherGate>
  );
}

function StudentDetailContent({
  token,
  teacherName,
  classId,
  studentId,
}: {
  token: string;
  teacherName: string;
  classId: string;
  studentId: string;
}) {
  const { data, error, retry } = useTeacherStudentProgress(token, classId, studentId);
  return (
    <TeacherFrame
      title={data?.student.displayName ?? 'Detail Student'}
      description={data?.class.name ?? 'Progress belajar Student'}
      teacherName={teacherName}
    >
      <Link className="monitoring-back" href={`/teacher/classes/${classId}`}>
        ← Kembali ke daftar Student
      </Link>
      {data ? (
        data.levels.length ? (
          <div className="monitoring-list">
            {data.levels.map((level) => (
              <section className="monitoring-notice" key={level.levelId}>
                <h2>{level.chapterLabel} · {level.subchapterLabel} · {level.levelLabel}</h2>
                <p>Status: {level.accessStatus === 'UNLOCKED' ? 'Terbuka' : 'Terkunci'}
                  {level.inProgress ? ' · Sedang dikerjakan' : ''}</p>
                <p>Nilai Drill terakhir: {level.latestDrillScore ?? 'Belum ada'}</p>
                <p>Nilai Drill terbaik: {level.bestDrillScore ?? 'Belum ada'}</p>
              </section>
            ))}
          </div>
        ) : (
          <section className="monitoring-notice" role="alert">
            <h2>Belum ada Level terbit</h2>
            <p>Progress akan tampil setelah materi demo diterbitkan.</p>
          </section>
        )
      ) : (
        <DataState error={error} retry={retry} />
      )}
    </TeacherFrame>
  );
}

function useTeacherStudentProgress(token: string, classId: string, studentId: string) {
  const { refresh } = useAuth();
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<TeacherStudentProgress | null>(null);
  const [error, setError] = useState<ApiProblem | null>(null);
  useEffect(() => {
    let active = true;
    getTeacherStudentProgress(token, classId, studentId).then(
      (result) => { if (active) setData(result); },
      (cause: unknown) => {
        if (active)
          setError(cause instanceof ApiProblem ? cause : new ApiProblem(0, 'API_ERROR', 'Permintaan gagal.'));
      },
    );
    return () => { active = false; };
  }, [token, classId, studentId, revision]);
  return {
    data,
    error,
    retry: error?.status === 401
      ? () => void refresh()
      : () => { setError(null); setRevision((value) => value + 1); },
  };
}

export function StudentDetailScreen({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  return (
    <TeacherGate key={`${classId}/${studentId}`}>
      {(token, name) => (
        <StudentDetailContent
          token={token}
          teacherName={name}
          classId={classId}
          studentId={studentId}
        />
      )}
    </TeacherGate>
  );
}
