'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { difficultyLabels, type Difficulty } from '@/features/pvp/demo-match';

const names = [
  'Alya P.',
  'Bima R.',
  'Citra N.',
  'Daffa A.',
  'Eka M.',
  'Farel S.',
  'Gita H.',
  'Hana K.',
  'Iqbal T.',
  'Jihan M.',
  'Kevin A.',
  'Laras P.',
  'Mika Z.',
  'Nabila S.',
  'Omar F.',
  'Putri D.',
  'Rafi A.',
  'Salsa N.',
  'Tio P.',
  'Vina M.',
];

const globalScores: Record<Difficulty, number> = { easy: 1435, medium: 1390, hard: 1345 };
const categories: Difficulty[] = ['easy', 'medium', 'hard'];

function LeaderboardsContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'global' | 'class'>(
    searchParams.get('tab') === 'class' ? 'class' : 'global',
  );
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [affiliation, setAffiliation] = useState<'school' | 'mandiri'>('school');
  const [mode, setMode] = useState<'ready' | 'empty' | 'error'>('ready');
  const classLocked = tab === 'class' && affiliation === 'mandiri';
  const entries = names.map((name, index) => ({
    rank: index + 1,
    name,
    points: tab === 'class' ? 8420 - index * 285 : globalScores[difficulty] - index * 27,
  }));
  const ownRank = tab === 'class' ? 23 : 28;
  const ownPoints = tab === 'class' ? 2190 : globalScores[difficulty] - 680;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="demo-eyebrow">PAPAN PERINGKAT · DEMO</p>
          <h1 className="demo-page-title">Rayakan progres bersama.</h1>
          <p className="demo-subtitle">
            Peringkat menggambarkan aktivitas atau rekor bermain, bukan ukuran kecerdasan atau nilai
            TKA resmi.
          </p>
        </div>
        <span className="demo-pill">SEMUA DATA FIKTIF</span>
      </div>

      <div className="demo-leaderboard-toolbar">
        <div className="demo-segment" role="group" aria-label="Jenis leaderboard">
          <button type="button" aria-pressed={tab === 'global'} onClick={() => setTab('global')}>
            Global PvP
          </button>
          <button type="button" aria-pressed={tab === 'class'} onClick={() => setTab('class')}>
            Kelas
          </button>
        </div>
        <div className="demo-segment" role="group" aria-label="Persona fiktif">
          <button
            type="button"
            aria-pressed={affiliation === 'school'}
            onClick={() => setAffiliation('school')}
          >
            Siswa Sekolah
          </button>
          <button
            type="button"
            aria-pressed={affiliation === 'mandiri'}
            onClick={() => setAffiliation('mandiri')}
          >
            Mandiri
          </button>
        </div>
      </div>

      {classLocked ? (
        <section className="demo-card demo-locked-card">
          <span className="demo-metric-icon peach" aria-hidden="true">
            ▥
          </span>
          <h2>Peringkat kelas terkunci</h2>
          <p>
            Siswa Mandiri belum menjadi anggota kelas. Mereka tetap dapat melihat leaderboard Global
            PvP dan membuat room PvP.
          </p>
          <button className="demo-button" type="button" onClick={() => setTab('global')}>
            Lihat Global PvP
          </button>
        </section>
      ) : (
        <>
          <section className="demo-card demo-leaderboard-intro">
            <div>
              <span className="demo-eyebrow">
                {tab === 'class' ? 'KELAS IX-A · CONTOH' : 'SEMUA SISWA · CONTOH'}
              </span>
              <h2>{tab === 'class' ? 'Peringkat keaktifan kelas' : 'Rekor terbaik PvP'}</h2>
              <p>
                {tab === 'class'
                  ? 'Akumulasi XP Drill + Tryout. PvP tidak dihitung di sini.'
                  : 'XP terbaik dari pertandingan PvP valid per kategori. Mandiri dan Sekolah tampil bersama.'}
              </p>
            </div>
            <div className="demo-period-card">
              <span aria-hidden="true">◷</span>
              <strong>Periode demo</strong>
              <small>Pembaruan tiap jam · arsip Rabu 23:59 WIB</small>
            </div>
          </section>

          {tab === 'global' && (
            <div className="demo-segment" role="group" aria-label="Kategori PvP">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={difficulty === category}
                  onClick={() => setDifficulty(category)}
                >
                  {difficultyLabels[category]}
                </button>
              ))}
            </div>
          )}

          <details className="demo-fixture-controls">
            <summary>Uji state prototype</summary>
            <div className="demo-segment mt-3" role="group" aria-label="State data demo">
              <button
                type="button"
                aria-pressed={mode === 'ready'}
                onClick={() => setMode('ready')}
              >
                Ada data
              </button>
              <button
                type="button"
                aria-pressed={mode === 'empty'}
                onClick={() => setMode('empty')}
              >
                Kosong
              </button>
              <button
                type="button"
                aria-pressed={mode === 'error'}
                onClick={() => setMode('error')}
              >
                Gagal
              </button>
            </div>
          </details>

          {mode !== 'ready' ? (
            <section
              className="demo-card demo-empty-card"
              role={mode === 'error' ? 'alert' : undefined}
            >
              <span className="demo-metric-icon purple" aria-hidden="true">
                {mode === 'error' ? '!' : '◎'}
              </span>
              <h2>
                {mode === 'error' ? 'Peringkat demo gagal dimuat' : 'Belum ada peringkat demo'}
              </h2>
              <p>
                {mode === 'error'
                  ? 'Ini contoh state kesalahan. Coba lagi untuk mengembalikan fixture.'
                  : 'Ini contoh state kosong sebelum ada hasil yang memenuhi syarat.'}
              </p>
              <button className="demo-button" type="button" onClick={() => setMode('ready')}>
                {mode === 'error' ? 'Coba lagi' : 'Tampilkan data demo'}
              </button>
            </section>
          ) : (
            <>
              <section aria-labelledby="demo-top-three-title">
                <div className="mb-4">
                  <h2 className="demo-section-title" id="demo-top-three-title">
                    Tiga teratas
                  </h2>
                  <p className="demo-section-note">Nama dan poin di bawah sepenuhnya fiktif.</p>
                </div>
                <div className="demo-podium">
                  {entries.slice(0, 3).map((entry) => (
                    <article
                      key={entry.rank}
                      className={`demo-podium-card ${entry.rank === 1 ? 'is-first' : ''}`}
                    >
                      <span className="demo-podium-rank">#{entry.rank}</span>
                      <span className="demo-avatar">{entry.name.charAt(0)}</span>
                      <strong>{entry.name}</strong>
                      <small>{entry.points.toLocaleString('id-ID')} XP</small>
                    </article>
                  ))}
                </div>
              </section>

              <div className="demo-grid-two demo-leaderboard-grid">
                <section className="demo-card demo-card-pad" aria-labelledby="demo-ranking-title">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="demo-section-title" id="demo-ranking-title">
                      Top 20
                    </h2>
                    <span className="demo-pill">DEMO</span>
                  </div>
                  <ol className="demo-ranking-list" start={4}>
                    {entries.slice(3).map((entry) => (
                      <li key={entry.rank}>
                        <span className="demo-ranking-number">{entry.rank}</span>
                        <span className="demo-avatar">{entry.name.charAt(0)}</span>
                        <span className="demo-ranking-name">{entry.name}</span>
                        <strong>
                          {entry.points.toLocaleString('id-ID')} <small>XP</small>
                        </strong>
                      </li>
                    ))}
                  </ol>
                </section>
                <aside className="demo-card demo-card-pad demo-own-rank">
                  <span className="demo-metric-icon gold" aria-hidden="true">
                    ★
                  </span>
                  <h2 className="demo-section-title mt-5">Posisi Anda · contoh</h2>
                  <p className="demo-section-note">Naya belum masuk top 20 pada fixture ini.</p>
                  <div className="demo-own-rank-number">#{ownRank}</div>
                  <p>
                    <strong>{ownPoints.toLocaleString('id-ID')} XP</strong> ·{' '}
                    {tab === 'class'
                      ? 'aktivitas kelas'
                      : `rekor ${difficultyLabels[difficulty]} PvP`}
                  </p>
                  <hr className="demo-divider my-5" />
                  <p className="demo-section-note">
                    {tab === 'class'
                      ? 'XP kelas berasal dari Drill dan Tryout, bukan PvP.'
                      : 'Rekor PvP tidak membuka level Drill atau menambah XP kelas.'}
                  </p>
                </aside>
              </div>
            </>
          )}
        </>
      )}
      <p className="demo-footnote">
        Fixture tidak membaca Supabase, tidak memperbarui tiap jam, dan tidak diarsip otomatis.
        Jadwal yang ditampilkan menjelaskan aturan PRD untuk implementasi terhubung.
      </p>
    </div>
  );
}

export default function LeaderboardsDemoPage() {
  return (
    <Suspense
      fallback={
        <p className="demo-subtitle" role="status">
          Memuat peringkat demo…
        </p>
      }
    >
      <LeaderboardsContent />
    </Suspense>
  );
}
