'use client';

import Link from 'next/link';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Button, Card, EmptyState, Icon, SectionHeader } from '@tka/ui';
import { StudentLayout } from '@/components/shell';
import { learningApi } from './api';
import { DataState, StudentGate } from './ui';
import { ActivityRow, ProgressSummary } from './cards';

export function AssessmentScreen() {
  return (
    <StudentLayout
      title="Progres & riwayat"
      subtitle="Lihat kemajuanmu, satu latihan pada satu waktu."
    >
      <StudentGate>{(token) => <AssessmentContent token={token} />}</StudentGate>
    </StudentLayout>
  );
}
function AssessmentContent({ token }: { token: string }) {
  const progress = useQuery({
    queryKey: ['student-progress'],
    queryFn: () => learningApi.progress(token),
  });
  const query = useInfiniteQuery({
    queryKey: ['assessment-history'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => learningApi.assessmentHistory(token, pageParam),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const records = query.data?.pages.flatMap((page) => page.records) ?? [];
  return (
    <div className="stack">
      {progress.isPending || progress.isError ? (
        <DataState
          pending={progress.isPending}
          error={progress.error}
          retry={() => void progress.refetch()}
        />
      ) : (
        <ProgressSummary progress={progress.data} />
      )}
      <section>
        <SectionHeader title="Riwayat aktivitas" subtitle="Hasil terbaru tampil paling atas." />
        {query.isPending || (query.isError && !query.data) ? (
          <DataState
            pending={query.isPending}
            error={query.error}
            retry={() => void query.refetch()}
          />
        ) : records.length ? (
          <div className="activity-list">
            {records.map((item) => (
              <ActivityRow key={item.attemptId} item={item} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Icon name="clock" />}
              title="Belum ada aktivitas"
              description="Selesaikan latihan pertamamu untuk melihat hasil di sini."
              action={
                <Link className="button-link" href="/student/learn">
                  Mulai belajar
                </Link>
              }
            />
          </Card>
        )}
        {query.hasNextPage && (
          <Button
            className="load-more"
            variant="secondary"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? 'Memuat…' : 'Muat hasil lain'}
          </Button>
        )}
        {query.isFetchNextPageError && (
          <p className="form-error" role="alert">
            Halaman berikutnya belum dapat dimuat. Coba muat kembali.
          </p>
        )}
      </section>
    </div>
  );
}
