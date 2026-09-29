'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { learningApi } from './api';
import { joinClass } from '@/lib/api';
import { useAuth } from '@/features/onboarding/auth';
import { DataState, LearningFrame, Panel, PrimaryButton, Status, StudentGate } from './ui';

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

export function DashboardScreen() {
  return <StudentGate>{(token) => <DashboardContent token={token} />}</StudentGate>;
}

function DashboardContent({ token }: { token: string }) {
  const areas = [
    {
      number: '01',
      title: 'Practice & Drill',
      description: 'Pilih bab, subbab, dan level. Kerjakan latihan dan lanjutkan progresmu.',
      href: '/student/learn',
      action: 'Jelajahi latihan',
      background: 'bg-[var(--numora-pearl)]',
    },
    {
      number: '02',
      title: 'TryOut',
      description: 'Lihat paket mingguan dan kerjakan simulasi saat tersedia untuk kelasmu.',
      href: '/student/tryout',
      action: 'Lihat TryOut',
      background: 'bg-white',
    },
    {
      number: '03',
      title: 'Penilaian',
      description: 'Buka hasil Drill tersimpan dan status penilaian TryOut setelah proses IRT.',
      href: '/student/assessment',
      action: 'Lihat hasil',
      background: 'bg-white',
    },
  ];
  return (
    <LearningFrame title="Beranda belajar">
      <section className="mb-6 overflow-hidden rounded-3xl bg-[var(--numora-purple)] px-6 py-8 text-white sm:px-10 sm:py-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--numora-ivory)]">
          Ruang belajar siswa
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
          Belajar bertahap, lihat kemajuanmu.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
          Mulai dari latihan per level, ikuti TryOut saat paket tersedia, lalu lihat hasil yang
          sudah diproses.
        </p>
      </section>
      <StudentGate>{(token) => <JoinClassPanel token={token} />}</StudentGate>
      <div className="grid gap-4 md:grid-cols-3">
        {areas.map((area) => (
          <Link
            key={area.number}
            href={area.href}
            className={`group flex min-h-64 flex-col rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--numora-purple)] hover:shadow-md ${area.background}`}
          >
            <span className="text-sm font-extrabold text-[var(--numora-purple)]">
              {area.number}
            </span>
            <h2 className="mt-5 text-xl font-extrabold">{area.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{area.description}</p>
            <span className="mt-5 font-semibold text-[var(--numora-purple)] group-hover:underline">
              {area.action} <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
      <section className="mt-8" aria-label="Ringkasan progres">
        <h2 className="mb-4 text-xl font-bold">Progresmu</h2>
        <DashboardData token={token} />
      </section>
    </LearningFrame>
  );
}

function JoinClassPanel({ token }: { token: string }) {
  const { state, refresh } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (state.status !== 'ready' || state.profile.studentAffiliation === 'SCHOOL') return null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!joinCode.trim()) return;
    setBusy(true);
    setError('');
    try {
      await joinClass(token, joinCode.trim());
      setJoinCode('');
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Belum dapat bergabung.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="mb-6 rounded-2xl border border-slate-200 bg-white p-6" onSubmit={(event) => void submit(event)}>
      <h2 className="text-xl font-bold">Gabung Class</h2>
      <p className="mt-2 text-sm text-slate-700">Masukkan kode dari Guru untuk terafiliasi dengan sekolah.</p>
      <label className="mt-4 block text-sm font-semibold" htmlFor="student-join-code">Kode Class</label>
      <input
        id="student-join-code"
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-4 sm:max-w-sm"
        value={joinCode}
        onChange={(event) => setJoinCode(event.target.value)}
        maxLength={32}
        required
      />
      {error && <p className="mt-2 text-red-700" role="alert">{error}</p>}
      <div className="mt-4">
        <PrimaryButton type="submit" disabled={busy}>{busy ? 'Bergabung…' : 'Gabung Class'}</PrimaryButton>
      </div>
    </form>
  );
}

function DashboardData({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ['student-progress'],
    queryFn: () => learningApi.progress(token),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <Panel>
      <p className="text-sm font-semibold text-[var(--numora-purple)]">Progres belajar</p>
      <h2 className="mt-2 text-xl font-bold">Lanjutkan belajar matematika</h2>
      <p className="mt-2 text-slate-700">
        {query.data.completedLevels} dari {query.data.totalLevels} level selesai.
      </p>
      {query.data.latestScore !== null && (
        <p className="mt-1 text-slate-700">Nilai Drill terakhir: {query.data.latestScore}</p>
      )}
      <Link
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--numora-purple)] px-5 font-semibold text-white"
        href="/student/learn"
      >
        Lihat materi
      </Link>
    </Panel>
  );
}

export function CatalogScreen() {
  return (
    <LearningFrame title="Pilih Bab">
      <StudentGate>{(token) => <CatalogData token={token} />}</StudentGate>
    </LearningFrame>
  );
}

function CatalogData({ token }: { token: string }) {
  const query = useQuery({ queryKey: ['chapters'], queryFn: () => learningApi.catalog(token) });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  if (!query.data.chapters.length)
    return <Status title="Materi belum tersedia">Bab belum diterbitkan.</Status>;
  return (
    <div className="grid gap-3">
      {sortByOrder(query.data.chapters).map((chapter) => (
        <Link
          key={chapter.id}
          className="flex min-h-16 items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 font-semibold shadow-sm hover:border-[var(--numora-purple)]"
          href={`/student/learn/${chapter.id}`}
        >
          <span>{chapter.title}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ))}
    </div>
  );
}

export function ChapterScreen() {
  const { chapterId } = useParams<{ chapterId: string }>();
  return (
    <LearningFrame title="Pilih Subbab">
      <StudentGate>{(token) => <ChapterData token={token} chapterId={chapterId} />}</StudentGate>
    </LearningFrame>
  );
}

function ChapterData({ token, chapterId }: { token: string; chapterId: string }) {
  const query = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => learningApi.chapter(token, chapterId),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <div>
      <p className="mb-5 text-slate-700">{query.data.chapter.title}</p>
      {!query.data.subchapters.length ? (
        <Status title="Subbab belum tersedia">Belum ada subbab pada bab ini.</Status>
      ) : (
        <div className="grid gap-3">
          {sortByOrder(query.data.subchapters).map((subchapter) => (
            <Link
              key={subchapter.id}
              className="flex min-h-16 items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 font-semibold shadow-sm hover:border-[var(--numora-purple)]"
              href={`/student/learn/${chapterId}/${subchapter.id}`}
            >
              <span>{subchapter.title}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubchapterScreen() {
  const { subchapterId } = useParams<{ subchapterId: string }>();
  return (
    <LearningFrame title="Pilih Level">
      <StudentGate>
        {(token) => <SubchapterData token={token} subchapterId={subchapterId} />}
      </StudentGate>
    </LearningFrame>
  );
}

function SubchapterData({ token, subchapterId }: { token: string; subchapterId: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ['subchapter', subchapterId],
    queryFn: () => learningApi.subchapter(token, subchapterId),
  });
  const start = useMutation({
    mutationFn: (levelId: string) => learningApi.start(token, levelId),
    onSuccess: (attempt) => router.push(`/student/drill/${attempt.id}`),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  return (
    <div>
      <p className="mb-5 text-slate-700">{query.data.subchapter.title}</p>
      {!query.data.levels.length ? (
        <Status title="Level belum tersedia">Belum ada level pada subbab ini.</Status>
      ) : (
        <div className="grid gap-3">
          {sortByOrder(query.data.levels).map((level) => (
            <Panel key={level.id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-bold">{level.title}</h2>
                <p className="mt-1 text-sm text-slate-700">
                  {level.status === 'locked'
                    ? 'Terkunci'
                    : level.status === 'inProgress'
                      ? 'Sedang dikerjakan'
                      : level.status === 'completed'
                        ? 'Selesai'
                        : 'Terbuka'}
                </p>
                {level.latestScore !== null && (
                  <p className="text-sm text-slate-700">
                    Terakhir {level.latestScore} · Terbaik {level.bestScore ?? level.latestScore}
                  </p>
                )}
              </div>
              {level.status === 'locked' ? (
                <span className="text-sm font-semibold text-slate-600">
                  Selesaikan level sebelumnya
                </span>
              ) : (
                <PrimaryButton disabled={start.isPending} onClick={() => start.mutate(level.id)}>
                  {level.status === 'inProgress' ? 'Lanjutkan Drill' : 'Mulai Drill'}
                </PrimaryButton>
              )}
            </Panel>
          ))}
        </div>
      )}
      {start.isError && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {start.error.message}
        </p>
      )}
    </div>
  );
}
