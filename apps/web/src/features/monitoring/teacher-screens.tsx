'use client';

import { useEffect, useState, type ReactNode, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, EmptyState, Icon, Input, SectionHeader } from '@tka/ui';
import { useAuth } from '@/features/onboarding/auth';
import { TeacherShell } from '@/components/shell';
import { destination } from '@/features/onboarding/destination';
import { LearningProvider } from '@/features/core-learning/provider';
import { DataState, Status } from '@/features/core-learning/ui';
import {
  createTeacherClass,
  getClassStudents,
  getTeacherClasses,
  getTeacherStudentProgress,
} from '@/lib/api';

export function TeacherGate({
  children,
}: {
  children: (token: string, name: string) => ReactNode;
}) {
  const { state, refresh } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (state.status === 'signed_out') router.replace('/');
    if (state.status === 'registration') router.replace('/onboarding');
    if (state.status === 'ready' && destination(state.profile) !== '/teacher')
      router.replace(destination(state.profile));
  }, [router, state]);
  if (state.status === 'ready' && destination(state.profile) === '/teacher')
    return (
      <LearningProvider key={state.profile.id}>
        {children(state.session.access_token, state.profile.displayName)}
      </LearningProvider>
    );
  return (
    <TeacherShell title="Ruang guru" teacherName="">
      {state.status === 'error' ? (
        <Status title="Akun belum dapat dimuat">
          <p>{state.message}</p>
          <Button onClick={() => void refresh()}>Coba lagi</Button>
        </Status>
      ) : state.status === 'disabled' ? (
        <Status title="Akun tidak aktif">Akses akun ini sedang tidak tersedia.</Status>
      ) : (
        <DataState pending />
      )}
    </TeacherShell>
  );
}
export function TeacherDashboardScreen() {
  return (
    <TeacherGate>
      {(token, name) => <TeacherDashboard token={token} teacherName={name} />}
    </TeacherGate>
  );
}
function TeacherDashboard({ token, teacherName }: { token: string; teacherName: string }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const cache = useQueryClient();
  const query = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => getTeacherClasses(token),
  });
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await createTeacherClass(token, name.trim());
      setCreatedCode(result.joinCode);
      setName('');
      await cache.invalidateQueries({ queryKey: ['teacher-classes'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kelas belum dapat dibuat.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <TeacherShell
      title="Kelas saya"
      description="Dampingi setiap langkah belajar siswa."
      teacherName={teacherName}
    >
      <div className="stack">
        <section className="teacher-welcome">
          <span className="icon-tile accent-0">
            <Icon name="school" />
          </span>
          <div>
            <span className="eyebrow">Ruang guru</span>
            <h2>Selamat datang, {teacherName}</h2>
            <p>Buka kelas untuk melihat siswa dan hasil latihan mereka.</p>
          </div>
          <Badge variant="success">Guru terverifikasi</Badge>
        </section>
        <details className="surface-card create-class">
          <summary>
            Buat kelas baru <Icon name="users" />
          </summary>
          <form className="inline-form" onSubmit={create}>
            <Input
              label="Nama kelas"
              placeholder="Contoh: IX A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? 'Membuat…' : 'Buat kelas'}
            </Button>
          </form>
        </details>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {createdCode && (
          <p className="success-message" role="status">
            Kelas berhasil dibuat. Bagikan kode <strong>{createdCode}</strong> kepada siswa.
          </p>
        )}
        <section>
          <SectionHeader
            title="Kelas yang kamu dampingi"
            subtitle={query.data ? `${query.data.items.length} kelas` : ''}
          />
          {query.isPending || query.isError ? (
            <DataState
              pending={query.isPending}
              error={query.error}
              retry={() => void query.refetch()}
            />
          ) : query.data.items.length ? (
            <div className="class-grid">
              {query.data.items.map((cls, index) => (
                <Link className="class-card" href={`/teacher/classes/${cls.id}`} key={cls.id}>
                  <span className={`icon-tile accent-${index % 4}`}>
                    <Icon name="users" />
                  </span>
                  <h3>{cls.name}</h3>
                  {cls.joinCode && (
                    <p>
                      Kode kelas <strong>{cls.joinCode}</strong>
                    </p>
                  )}
                  <span className="card-link">
                    Lihat siswa <Icon name="arrow" />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Icon name="users" />}
                title="Kelas pertama dimulai di sini"
                description="Buat kelas dan bagikan kode bergabung kepada siswa."
              />
            </Card>
          )}
        </section>
      </div>
    </TeacherShell>
  );
}
export function ClassStudentsScreen({ classId }: { classId: string }) {
  return (
    <TeacherGate>
      {(token, name) => <ClassStudentsContent token={token} teacherName={name} classId={classId} />}
    </TeacherGate>
  );
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
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('asc');
  const query = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => getClassStudents(token, classId),
  });
  const filtered = query.data?.items
    .filter((s) => s.displayName.toLocaleLowerCase('id').includes(search.toLocaleLowerCase('id')))
    .sort((a, b) => (sort === 'asc' ? 1 : -1) * a.displayName.localeCompare(b.displayName, 'id'));
  return (
    <TeacherShell
      title={query.data?.class.name ?? 'Daftar siswa'}
      description="Kenali perkembangan siswa melalui hasil latihan mereka."
      teacherName={teacherName}
    >
      <div className="stack">
        <Link className="back-link" href="/teacher">
          <Icon name="back" />
          Kembali ke kelas saya
        </Link>
        <div className="catalog-toolbar">
          <Input
            label="Cari siswa"
            type="search"
            placeholder="Nama siswa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="search" />}
          />
          <label className="sort-field">
            Urutkan
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="asc">Nama A–Z</option>
              <option value="desc">Nama Z–A</option>
            </select>
          </label>
        </div>
        {query.isPending || query.isError ? (
          <DataState
            pending={query.isPending}
            error={query.error}
            retry={() => void query.refetch()}
          />
        ) : (
          <section>
            <SectionHeader
              title="Siswa di kelas ini"
              subtitle={`${query.data.items.length} siswa bergabung`}
            />
            {filtered?.length ? (
              <div className="settings-list">
                {filtered.map((student) => (
                  <Link
                    className="settings-row"
                    href={`/teacher/classes/${classId}/students/${student.id}`}
                    key={student.id}
                  >
                    <span className="account-avatar">
                      {student.displayName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{student.displayName}</strong>
                      <p>Lihat progres dan nilai Drill</p>
                    </div>
                    <Icon name="chevron" />
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Icon name="users" />}
                  title={query.data.items.length ? 'Siswa tidak ditemukan' : 'Belum ada siswa'}
                  description={
                    query.data.items.length
                      ? 'Coba nama atau kata kunci lain.'
                      : 'Siswa yang bergabung menggunakan kode kelas akan tampil di sini.'
                  }
                />
              </Card>
            )}
          </section>
        )}
      </div>
    </TeacherShell>
  );
}
export function StudentProgressScreen({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) {
  return (
    <TeacherGate>
      {(token, name) => (
        <StudentProgressContent
          token={token}
          teacherName={name}
          classId={classId}
          studentId={studentId}
        />
      )}
    </TeacherGate>
  );
}
function StudentProgressContent({
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
  const query = useQuery({
    queryKey: ['student-progress', classId, studentId],
    queryFn: () => getTeacherStudentProgress(token, classId, studentId),
  });
  return (
    <TeacherShell
      title={query.data?.student.displayName ?? 'Progres siswa'}
      description={query.data?.class.name}
      teacherName={teacherName}
    >
      <div className="stack">
        <Link className="back-link" href={`/teacher/classes/${classId}`}>
          <Icon name="back" />
          Kembali ke daftar siswa
        </Link>
        {query.isPending || query.isError ? (
          <DataState
            pending={query.isPending}
            error={query.error}
            retry={() => void query.refetch()}
          />
        ) : (
          <>
            <section className="teacher-welcome">
              <span className="icon-tile accent-2">
                <Icon name="chart" />
              </span>
              <div>
                <span className="eyebrow">Nilai Drill terakhir</span>
                <h2>{query.data.latestDrillScore ?? 'Belum ada latihan'}</h2>
                <p>Nilai terakhir dan terbaik setiap level tercatat di bawah.</p>
              </div>
            </section>
            <SectionHeader title="Progres per level" />
            {query.data.levels.length ? (
              <div className="level-grid">
                {query.data.levels.map((level) => (
                  <Card className="level-card" key={level.levelId}>
                    <span className="eyebrow">{level.chapterLabel}</span>
                    <h3>{level.subchapterLabel}</h3>
                    <p>{level.levelLabel}</p>
                    <Badge variant={level.inProgress ? 'primary' : 'default'}>
                      {level.inProgress
                        ? 'Sedang dikerjakan'
                        : level.accessStatus === 'UNLOCKED'
                          ? 'Terbuka'
                          : 'Terkunci'}
                    </Badge>
                    <dl className="score-pair">
                      <div>
                        <dt>Terakhir</dt>
                        <dd>{level.latestDrillScore ?? '—'}</dd>
                      </div>
                      <div>
                        <dt>Terbaik</dt>
                        <dd>{level.bestDrillScore ?? '—'}</dd>
                      </div>
                    </dl>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Icon name="book" />}
                  title="Belum ada level"
                  description="Progres tampil setelah materi tersedia."
                />
              </Card>
            )}
          </>
        )}
      </div>
    </TeacherShell>
  );
}
