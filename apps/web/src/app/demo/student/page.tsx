'use client';

import Link from 'next/link';
import { useState } from 'react';

const activity = [
  {
    icon: '✦',
    title: 'Drill Persamaan Linear',
    detail: 'Nilai 90 · Level 2 terbuka',
    time: 'Kemarin',
  },
  {
    icon: '★',
    title: 'Bintang baru didapat',
    detail: '3 bintang pada latihan demo',
    time: '2 hari lalu',
  },
  {
    icon: '↗',
    title: 'Progres meningkat',
    detail: 'Bab Aljabar · 3 dari 5 level',
    time: '3 hari lalu',
  },
];

export default function StudentDemoPage() {
  const [affiliation, setAffiliation] = useState<'school' | 'mandiri'>('school');
  const school = affiliation === 'school';

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="demo-eyebrow">BERANDA SISWA · DEMO</p>
          <h1 className="demo-page-title">
            Halo, Naya! <span aria-hidden="true">✦</span>
          </h1>
          <p className="demo-subtitle">
            Satu langkah kecil hari ini membuat matematika terasa lebih mudah.
          </p>
        </div>
        <div className="demo-segment" role="group" aria-label="Pilih persona fiktif">
          <button type="button" aria-pressed={school} onClick={() => setAffiliation('school')}>
            Siswa Sekolah
          </button>
          <button type="button" aria-pressed={!school} onClick={() => setAffiliation('mandiri')}>
            Mandiri
          </button>
        </div>
      </div>

      <section className="demo-hero" aria-label="Aksi belajar berikutnya">
        <div className="demo-hero-copy">
          <span className="demo-hero-kicker">PROGRES LATIHAN · DEMO</span>
          <h2>Belajar matematika, satu level demi satu level.</h2>
          <p>
            3 dari 5 level Aljabar selesai. Ini contoh progres fiktif.
          </p>
          <div className="demo-progress" role="progressbar" aria-label="Progres Aljabar demo"
            aria-valuenow={3} aria-valuemin={0} aria-valuemax={5}><span style={{ width: '60%' }} /></div>
          <div className="flex flex-wrap gap-3">
            <Link className="demo-button demo-button-inverse" href="/demo/pvp">
              Jelajahi PvP <span aria-hidden="true">↗</span>
            </Link>
            <span className="demo-hero-hint">Drill akan hadir di alur terhubung</span>
          </div>
        </div>
        <div className="demo-hero-art" aria-hidden="true">
          <div className="demo-art-orbit">
            <span>∑</span>
            <span>π</span>
            <span>×</span>
          </div>
          <img className="demo-art-center" src="/figma/numora-owl-source.png" alt="" />
        </div>
      </section>

      <div className="demo-grid-three demo-student-metrics">
        <article className="demo-card demo-card-pad">
          <span className="demo-metric-icon purple" aria-hidden="true">
            ◎
          </span>
          <p className="demo-metric-label">Status belajar</p>
          <h2 className="demo-metric-value">{school ? 'Siswa Sekolah' : 'User Mandiri'}</h2>
          <p className="demo-section-note">
            {school
              ? 'Kelas IX-A · SMP Nusantara (demo)'
              : 'Belajar mandiri, tetap bisa Drill dan PvP.'}
          </p>
        </article>
        <article className="demo-card demo-card-pad">
          <span className="demo-metric-icon peach" aria-hidden="true">
            ↗
          </span>
          <p className="demo-metric-label">Progres Aljabar</p>
          <h2 className="demo-metric-value">
            3 dari 5 <small>level</small>
          </h2>
          <div
            className="demo-progress"
            role="progressbar"
            aria-label="Progres Aljabar demo"
            aria-valuenow={3}
            aria-valuemin={0}
            aria-valuemax={5}
          >
            <span style={{ width: '60%' }} />
          </div>
        </article>
        <article className="demo-card demo-card-pad">
          <span className="demo-metric-icon gold" aria-hidden="true">
            ★
          </span>
          <p className="demo-metric-label">Nilai Drill terbaik</p>
          <h2 className="demo-metric-value">
            90 <small>/ 100</small>
          </h2>
          <p className="demo-section-note">Nilai latihan, terpisah dari XP keaktifan.</p>
        </article>
      </div>

      <div className="demo-grid-two">
        <section className="demo-card demo-card-pad">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="demo-section-title">Aktivitas terbaru</h2>
              <p className="demo-section-note">Contoh riwayat belajar fiktif.</p>
            </div>
            <span className="demo-pill">DEMO</span>
          </div>
          <ul className="demo-activity-list">
            {activity.map((item) => (
              <li key={item.title}>
                <span className="demo-activity-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
                <time>{item.time}</time>
              </li>
            ))}
          </ul>
        </section>
        <section className="demo-card demo-card-pad">
          <h2 className="demo-section-title">Ruang seru lainnya</h2>
          <p className="demo-section-note">Coba tampilan permainan dan lihat peringkat contoh.</p>
          <div className="demo-feature-list">
            <Link href="/demo/pvp" className="demo-feature-link">
              <span className="demo-feature-icon" aria-hidden="true">
                ⚔
              </span>
              <span>
                <strong>Main PvP</strong>
                <small>Simulasi duel 10 soal</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/demo/leaderboards" className="demo-feature-link">
              <span className="demo-feature-icon gold" aria-hidden="true">
                ★
              </span>
              <span>
                <strong>Peringkat Global PvP</strong>
                <small>Rekor contoh per tingkat kesulitan</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
            {school ? (
              <Link href="/demo/leaderboards?tab=class" className="demo-feature-link">
                <span className="demo-feature-icon peach" aria-hidden="true">
                  ▥
                </span>
                <span>
                  <strong>Peringkat Kelas</strong>
                  <small>XP Drill + Tryout contoh</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <div className="demo-feature-link is-locked" aria-disabled="true">
                <span className="demo-feature-icon peach" aria-hidden="true">
                  ▥
                </span>
                <span>
                  <strong>Peringkat Kelas terkunci</strong>
                  <small>Bergabung ke kelas untuk membuka fitur ini.</small>
                </span>
                <span aria-hidden="true">⌁</span>
              </div>
            )}
          </div>
        </section>
      </div>
      <p className="demo-footnote">
        Semua identitas, skor, dan aktivitas pada halaman ini adalah fixture demo dan tidak
        tersimpan sebagai hasil belajar.
      </p>
    </div>
  );
}
