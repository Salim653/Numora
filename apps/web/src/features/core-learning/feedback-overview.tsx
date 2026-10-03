'use client';

import { useQuery } from '@tanstack/react-query';
import type { FeedbackSummaryDto } from '@/lib/generated-api-types';
import { request } from './api';
import { Panel } from './ui';

export function FeedbackOverview({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ['student-feedback-summary'],
    queryFn: () => request<FeedbackSummaryDto>(token, '/students/me/feedback/summary'),
    staleTime: 60_000,
  });
  return (
    <Panel>
      <h2 className="text-lg font-bold">Catatan Guru</h2>
      {query.isPending ? (
        <p role="status">Memuat catatan Guru…</p>
      ) : query.isError ? (
        <div>
          <p role="alert">Catatan belum dapat dimuat. Aktivitas belajar tetap tersedia.</p>
          <button className="min-h-11 font-semibold underline" onClick={() => void query.refetch()}>
            Coba muat catatan lagi
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm">{query.data.unreadCount} catatan belum dibaca.</p>
          {!query.data.latest.length ? (
            <p className="mt-2 text-sm text-slate-700">Belum ada catatan dari Guru.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {query.data.latest.map((item) => (
                <li key={item.id} className="border-t border-[var(--color-border)] pt-3">
                  <p className="font-semibold">
                    {item.teacherName}
                    {item.readAt === null ? ' · Belum dibaca' : ''}
                  </p>
                  <p className="whitespace-pre-wrap break-words mt-1">{item.body}</p>
                  <time className="text-xs text-slate-700" dateTime={item.sentAt}>
                    {new Intl.DateTimeFormat('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      dateStyle: 'medium',
                    }).format(new Date(item.sentAt))}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  );
}
