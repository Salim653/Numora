'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { StudentDashboardDto } from './generated-types';
import { request } from './api';
import { useStudentToken } from './student-session';
import { DataState } from './ui';
import { JoinClassPanel } from './catalog';

export function DashboardScreen() {
  const token = useStudentToken();
  const query = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => request<StudentDashboardDto>(token, '/students/me/dashboard'),
  });
  if (query.isPending || query.isError)
    return (
      <DataState pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
    );
  const data = query.data;
  const progress = data.availableLevels
    ? Math.round((100 * data.completedLevels) / data.availableLevels)
    : 0;
  const features = [
    {
      href: '/student/learn',
      title: 'Practice & Drill',
      detail: data.features.drill ? 'Latihan sesuai levelmu' : 'Belum tersedia',
      icon: '✎',
    },
    {
      href: '/student/tryout',
      title: 'Tryout',
      detail: data.features.tryout
        ? 'Paket simulasi mingguan'
        : 'Bergabung ke kelas untuk mengakses',
      icon: '▤',
    },
    {
      href: '/student/assessment',
      title: 'Penilaian',
      detail: 'Hasil dan riwayat asesmen',
      icon: '✓',
    },
    {
      href: '/student/pvp',
      title: 'PvP',
      detail: data.features.pvp ? 'Duel matematika 10 soal' : 'PvP belum tersedia',
      icon: '⚔',
    },
    {
      href: '/student/leaderboards',
      title: 'Peringkat',
      detail: data.features.classLeaderboard
        ? 'Peringkat kelas dan PvP'
        : 'Lihat ketersediaan peringkat',
      icon: '★',
    },
  ];
  return (
    <div className="space-y-7">
      <div>
        <p className="student-eyebrow">BERANDA SISWA</p>
        <h1 className="student-page-title">
          Halo, {data.displayName}! <span aria-hidden="true">✦</span>
        </h1>
        <p className="student-subtitle">
          Satu langkah kecil hari ini membuat matematika terasa lebih mudah.
        </p>
      </div>
      <section className="student-hero" aria-label="Aksi belajar berikutnya">
        <div className="student-hero-copy">
          <span className="student-hero-kicker">LANGKAH BERIKUTNYA</span>
          <h2>Siap mengasah logika?</h2>
          <p>
            Latihan singkat untuk menjaga ritme belajar. Lanjutkan progres yang tersimpan di akunmu.
          </p>
          <Link
            className="student-button student-button-inverse"
            href={
              data.activeDrill ? `/student/drill/${data.activeDrill.attemptId}` : '/student/learn'
            }
          >
            {data.activeDrill ? 'Lanjutkan latihan' : 'Mulai latihan'}{' '}
            <span aria-hidden="true">↗</span>
          </Link>
          {data.activeDrill && <p className="student-hero-hint">{data.activeDrill.title}</p>}
        </div>
        <div className="student-hero-art" aria-hidden="true">
          <div className="student-art-orbit">
            <span>∑</span>
            <span>π</span>
            <span>×</span>
          </div>
          <div className="student-art-center">N</div>
        </div>
      </section>
      <div className="student-grid-three">
        <article className="student-card student-card-pad">
          <span className="student-metric-icon purple" aria-hidden="true">
            ◎
          </span>
          <p className="student-metric-label">Status belajar</p>
          <h2 className="student-metric-value">
            {data.affiliation === 'SCHOOL' ? 'Siswa Sekolah' : 'User Mandiri'}
          </h2>
          <p className="student-section-note">
            {data.class
              ? `${data.class.name} · ${data.class.schoolName}`
              : 'Belajar mandiri sesuai ritmemu.'}
          </p>
        </article>
        <article className="student-card student-card-pad">
          <span className="student-metric-icon peach" aria-hidden="true">
            ↗
          </span>
          <p className="student-metric-label">Progres belajar</p>
          <h2 className="student-metric-value">
            {data.completedLevels} dari {data.availableLevels} <small>level</small>
          </h2>
          {data.availableLevels > 0 ? (
            <div
              className="student-progress"
              role="progressbar"
              aria-label="Progres belajar"
              aria-valuenow={data.completedLevels}
              aria-valuemin={0}
              aria-valuemax={data.availableLevels}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <p className="student-section-note">Materi belum diterbitkan.</p>
          )}
        </article>
        <article className="student-card student-card-pad">
          <span className="student-metric-icon gold" aria-hidden="true">
            ★
          </span>
          <p className="student-metric-label">Nilai Drill terbaik</p>
          <h2 className="student-metric-value">
            {data.bestDrillScore ?? '—'}
            {data.bestDrillScore !== null && <small> / 100</small>}
          </h2>
          <p className="student-section-note">
            {data.latestDrillScore === null
              ? 'Belum ada Drill selesai.'
              : `Nilai terakhir: ${data.latestDrillScore}`}
          </p>
        </article>
      </div>
      <JoinClassPanel token={token} />
      <div className="student-grid-two">
        <section className="student-card student-card-pad">
          <h2 className="student-section-title">Aktivitas terbaru</h2>
          <p className="student-section-note">Lima asesmen terbaru dari akunmu.</p>
          {!data.activities.length ? (
            <p className="py-6">Belum ada aktivitas. Mulai latihan pertamamu.</p>
          ) : (
            <ul className="student-activity-list">
              {data.activities.map((item) => (
                <li key={item.attemptId}>
                  <span className="student-activity-icon" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    <Link
                      href={
                        item.activity === 'drill'
                          ? `/student/drill/${item.attemptId}/result`
                          : item.activity === 'tryout'
                            ? `/student/tryout/${item.attemptId}/result`
                            : '/student/assessment'
                      }
                    >
                      <strong>{item.title}</strong>
                    </Link>
                    <small>
                      {item.resultState === 'waitingIrt'
                        ? 'Menunggu IRT'
                        : item.score === null
                          ? 'Hasil tersimpan'
                          : `Nilai ${item.score}`}
                    </small>
                  </span>
                  <time dateTime={item.submittedAt}>
                    {new Intl.DateTimeFormat('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      day: 'numeric',
                      month: 'short',
                    }).format(new Date(item.submittedAt))}
                  </time>
                </li>
              ))}
            </ul>
          )}
          <Link className="student-text-link" href="/student/assessment">
            Lihat semua hasil →
          </Link>
        </section>
        <section className="student-card student-card-pad">
          <h2 className="student-section-title">Ruang belajar lainnya</h2>
          <div className="student-feature-list">
            {features.map((item) => (
              <Link key={item.href} className="student-feature-link" href={item.href}>
                <span className="student-feature-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
