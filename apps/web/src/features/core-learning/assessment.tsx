'use client';

import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { learningApi } from './api';
import { DataState, LearningFrame, Panel, Status, StudentGate } from './ui';

export function AssessmentScreen() {
  return (
    <LearningFrame title="Penilaian">
      <Panel className="mb-5 bg-[var(--numora-pearl)]">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--numora-purple)]">
          Hasil belajar
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">Lihat hasil yang sudah tersimpan.</h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-700">
          Nilai Drill tersedia setelah submit. Hasil TryOut dan pembahasannya muncul setelah batch
          IRT selesai. Penilaian ditentukan server, bukan halaman ini.
        </p>
      </Panel>
      <StudentGate>{(token) => <AssessmentHistoryData token={token} />}</StudentGate>
    </LearningFrame>
  );
}

function AssessmentHistoryData({ token }: { token: string }) {
  const query = useInfiniteQuery({
    queryKey: ['assessment-history'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => learningApi.assessmentHistory(token, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const records = query.data.pages.flatMap((page) => page.records);
  if (!records.length)
    return (
      <Status title="Belum ada penilaian">
        Selesaikan Drill atau TryOut untuk melihat riwayat hasil di sini.
      </Status>
    );
  return (
    <div className="grid gap-3">
      {records.map((record) => (
        <Panel key={record.attemptId} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--numora-purple)]">
              {record.activity === 'drill' ? 'Practice & Drill' : 'TryOut'}
            </p>
            <h2 className="mt-1 font-bold">{record.title}</h2>
            <p className="mt-1 text-sm text-slate-700">
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeZone: 'Asia/Jakarta',
              }).format(new Date(record.submittedAt))}
            </p>
            <p className="mt-2 text-sm font-semibold">
              {record.resultState === 'waitingIrt'
                ? 'Menunggu hasil IRT'
                : `Nilai: ${record.score ?? 'Belum tersedia'}`}
            </p>
          </div>
          {record.resultState === 'ready' && (
            <Link
              className="min-h-11 rounded-xl bg-[var(--numora-purple)] px-5 py-3 font-semibold text-white"
              href={
                record.activity === 'drill'
                  ? `/student/drill/${record.attemptId}/result`
                  : `/student/tryout/${record.attemptId}/result`
              }
            >
              Lihat detail
            </Link>
          )}
        </Panel>
      ))}
      {query.hasNextPage && (
        <button
          className="min-h-11 rounded-xl border border-[var(--numora-purple)] bg-white px-5 font-semibold text-[var(--numora-purple)] disabled:opacity-50"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? 'Memuat…' : 'Muat hasil lain'}
        </button>
      )}
      {query.isFetchNextPageError && (
        <p role="alert" className="text-sm text-red-700">
          Halaman berikutnya belum dapat dimuat. Coba lagi.
        </p>
      )}
    </div>
  );
}
