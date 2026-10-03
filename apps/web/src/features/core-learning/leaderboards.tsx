'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from './api';
import type { LeaderboardDto } from './generated-types';
import { useStudentToken } from './student-session';
import { DataState, Status } from './ui';

export function LeaderboardsScreen() {
  const token = useStudentToken();
  const [tab, setTab] = useState<'pvp' | 'class'>('pvp');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'class') setTab('class');
  }, []);
  const query = useQuery({
    queryKey: ['student-leaderboard', tab, difficulty],
    queryFn: () =>
      request<LeaderboardDto>(
        token,
        tab === 'class' ? '/leaderboards/class' : `/leaderboards/pvp?difficulty=${difficulty}`,
      ),
  });
  return (
    <div className="space-y-7">
      <div className="student-leaderboard-intro">
        <div>
          <p className="student-eyebrow">LANGKAHMU BERARTI</p>
          <h1 className="student-page-title">
            Peringkat <span aria-hidden="true">★</span>
          </h1>
          <p className="student-subtitle">Rekor PvP dan XP kelas memiliki peringkat terpisah.</p>
        </div>
        <span className="student-pill">PERIODE WIB</span>
      </div>
      <div className="student-segment" role="group" aria-label="Jenis peringkat">
        <button aria-pressed={tab === 'pvp'} onClick={() => setTab('pvp')}>
          Global PvP
        </button>
        <button aria-pressed={tab === 'class'} onClick={() => setTab('class')}>
          Kelas
        </button>
      </div>
      {tab === 'pvp' && (
        <div className="student-segment" role="group" aria-label="Kesulitan PvP">
          {(['easy', 'medium', 'hard'] as const).map((d, i) => (
            <button key={d} aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>
              {['Mudah', 'Sedang', 'Sulit'][i]}
            </button>
          ))}
        </div>
      )}
      {query.isPending || query.isError ? (
        <DataState
          pending={query.isPending}
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          {query.data.policyPending && (
            <Status title="Peringkat belum tersedia">
              {tab === 'class'
                ? 'Aturan XP kelas sedang ditetapkan. XP PvP tidak masuk peringkat kelas.'
                : 'Pertandingan PvP belum dibuka. Rekor akan tampil setelah fitur tersedia.'}
            </Status>
          )}
          <div className="student-leaderboard-grid">
            <section className="student-card student-card-pad">
              <h2 className="student-section-title">
                {tab === 'class' ? query.data.className : 'Top 20 Global PvP'}
              </h2>
              <p className="student-section-note">
                {new Intl.DateTimeFormat('id-ID', {
                  timeZone: 'Asia/Jakarta',
                  day: 'numeric',
                  month: 'short',
                }).format(new Date(query.data.period.startsAt))}{' '}
                –{' '}
                {new Intl.DateTimeFormat('id-ID', {
                  timeZone: 'Asia/Jakarta',
                  day: 'numeric',
                  month: 'short',
                }).format(new Date(Date.parse(query.data.period.endsAt) - 1))}{' '}
                WIB
              </p>
              {query.data.policyPending ? (
                <p className="py-8">Peringkat final menunggu persetujuan aturan.</p>
              ) : !query.data.entries.length ? (
                <p className="py-8">Belum ada rekor pada periode ini.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full mt-6 text-left">
                    <caption className="sr-only">
                      Peringkat berdasarkan {query.data.unit === 'xp' ? 'XP' : 'poin terbaik'}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col" className="py-3">
                          Posisi
                        </th>
                        <th scope="col">Siswa</th>
                        <th scope="col">{query.data.unit === 'xp' ? 'XP' : 'Poin'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {query.data.entries.map((entry) => (
                        <tr key={entry.studentId} className="border-t border-[var(--color-border)]">
                          <td className="py-4 font-bold">{entry.rank}</td>
                          <td>{entry.displayName}</td>
                          <td>{entry.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="student-section-note mt-4">
                {query.data.updatedAt
                  ? `Diperbarui ${new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(query.data.updatedAt))} WIB`
                  : 'Menunggu pembaruan peringkat.'}
              </p>
              <button
                className="min-h-11 font-semibold underline mt-2"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                {query.isFetching ? 'Memperbaruiâ€¦' : 'Perbarui peringkat'}
              </button>
            </section>
            <aside className="student-card student-card-pad student-own-rank">
              <h2 className="student-section-title">Posisimu</h2>
              {query.data.policyPending ? (
                <p className="student-section-note mt-4">
                  Posisimu tersedia setelah peringkat dibuka.
                </p>
              ) : query.data.ownEntry ? (
                <>
                  <p className="student-metric-value">#{query.data.ownEntry.rank}</p>
                  <p>
                    {query.data.ownEntry.points} {query.data.unit === 'xp' ? 'XP' : 'poin terbaik'}
                  </p>
                </>
              ) : (
                <p className="student-section-note mt-4">Belum memiliki rekor pada periode ini.</p>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
