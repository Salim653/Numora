'use client';

import Link from 'next/link';
import { useEffect, useReducer } from 'react';
import {
  demoMatchReducer,
  demoQuestions,
  difficultyLabels,
  durations,
  initialMatch,
  type Difficulty,
} from '@/features/pvp/demo-match';

const choices: Difficulty[] = ['easy', 'medium', 'hard'];
const letters = ['A', 'B', 'C', 'D'];

export default function PvpDemoPage() {
  const [match, dispatch] = useReducer(demoMatchReducer, initialMatch);
  const question = demoQuestions[match.index] ?? demoQuestions[0]!;

  useEffect(() => {
    if (match.phase !== 'question' && !match.disconnected) return;
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(timer);
  }, [match.phase, match.disconnected]);

  useEffect(() => {
    if (match.phase !== 'question' || !match.locked || match.opponentAnswered) return;
    const timer = window.setTimeout(() => dispatch({ type: 'opponentAnswer' }), 1300);
    return () => window.clearTimeout(timer);
  }, [match.phase, match.locked, match.opponentAnswered]);

  return (
    <div className="space-y-7">
      <div>
        <p className="demo-eyebrow">ARENA PvP · DEMO</p>
        <h1 className="demo-page-title">Tantangan matematika, berdua.</h1>
        <p className="demo-subtitle">
          Jelajahi alur duel 1v1. Lawan, room, timer, dan hasil di sini adalah simulasi lokal; belum
          terhubung ke pemain lain.
        </p>
      </div>

      <div className="demo-pvp-notice" role="note">
        <span aria-hidden="true">✦</span>
        <span>
          Siswa Mandiri dan Sekolah sama-sama dapat bermain PvP. Versi demo ini tidak membuat XP
          atau rekor leaderboard.
        </span>
      </div>

      {match.phase === 'lobby' && (
        <div className="demo-grid-two demo-pvp-grid">
          <section className="demo-card demo-card-pad">
            <span className="demo-metric-icon purple" aria-hidden="true">
              ⚔
            </span>
            <h2 className="demo-section-title mt-5">Buat room baru</h2>
            <p className="demo-section-note">
              Pilih kategori. Kedua pemain akan melihat 10 soal dengan urutan yang sama pada versi
              terhubung.
            </p>
            <fieldset className="demo-difficulty-list mt-6">
              <legend className="mb-3 text-sm font-extrabold">Tingkat kesulitan</legend>
              {choices.map((difficulty) => (
                <label
                  key={difficulty}
                  className={`demo-difficulty ${match.difficulty === difficulty ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={difficulty}
                    checked={match.difficulty === difficulty}
                    onChange={() => dispatch({ type: 'chooseDifficulty', difficulty })}
                  />
                  <span>
                    <strong>{difficultyLabels[difficulty]}</strong>
                    <small>{durations[difficulty]} detik per soal</small>
                  </span>
                  <span aria-hidden="true">{match.difficulty === difficulty ? '●' : '○'}</span>
                </label>
              ))}
            </fieldset>
            <button
              className="demo-button mt-6 w-full"
              type="button"
              onClick={() => dispatch({ type: 'createRoom' })}
            >
              Buat room demo <span aria-hidden="true">→</span>
            </button>
          </section>
          <section className="demo-card demo-card-pad demo-lobby-aside">
            <span className="demo-metric-icon gold" aria-hidden="true">
              ★
            </span>
            <h2 className="demo-section-title mt-5">Cara bermain</h2>
            <ol className="demo-steps">
              <li>
                <span>1</span>
                <p>Buat room dan tunggu satu lawan bergabung.</p>
              </li>
              <li>
                <span>2</span>
                <p>Jawab 10 soal. Pilihan terkunci setelah dikirim.</p>
              </li>
              <li>
                <span>3</span>
                <p>Lanjut ke soal berikutnya setelah kedua pemain menjawab atau waktu habis.</p>
              </li>
            </ol>
            <p className="demo-section-note">
              Dalam produk nyata, waktu, jawaban, dan poin ditentukan oleh server NestJS.
            </p>
            <p className="demo-section-note mt-3">
              Pada prototype ini, kategori hanya mengubah timer; soal fiktifnya sama.
            </p>
          </section>
        </div>
      )}

      {(match.phase === 'room' || match.phase === 'ready') && (
        <section className="demo-card demo-room-card">
          <div className="demo-room-icon" aria-hidden="true">
            ⚔
          </div>
          <span className="demo-pill">ROOM SIMULASI</span>
          <h2>{match.phase === 'room' ? 'Room berhasil dibuat' : 'Dua pemain sudah bergabung'}</h2>
          <p className="demo-muted">
            Kode contoh ini tidak dapat dipakai untuk mengundang pemain sungguhan.
          </p>
          <div className="demo-room-code" aria-label="Kode room demo">
            DEMO-2478
          </div>
          <div className="demo-player-row">
            <div>
              <span className="demo-avatar">N</span>
              <strong>Naya</strong>
              <small>Anda · demo</small>
            </div>
            <span className="demo-vs">VS</span>
            <div>
              <span className="demo-avatar peach">R</span>
              <strong>{match.phase === 'ready' ? 'Raka' : 'Menunggu…'}</strong>
              <small>Lawan simulasi</small>
            </div>
          </div>
          {match.phase === 'room' ? (
            <button
              className="demo-button mt-6"
              type="button"
              onClick={() => dispatch({ type: 'joinOpponent' })}
            >
              Simulasikan lawan bergabung
            </button>
          ) : (
            <button
              className="demo-button mt-6"
              type="button"
              onClick={() => dispatch({ type: 'start' })}
            >
              Saya siap · mulai 10 soal
            </button>
          )}
          <button
            className="demo-button demo-button-ghost mt-3"
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
          >
            Kembali ke lobby
          </button>
        </section>
      )}

      {(match.phase === 'question' || match.phase === 'resolved') && (
        <div className="demo-pvp-play">
          <section className="demo-card demo-card-pad">
            <div className="demo-match-top">
              <div>
                <span className="demo-eyebrow">PERTANDINGAN DEMO</span>
                <h2 className="demo-section-title">
                  Soal {match.index + 1} dari {demoQuestions.length}
                </h2>
              </div>
              <div
                className={`demo-timer ${match.remaining <= 10 ? 'is-urgent' : ''}`}
                role="timer"
                aria-label={`Sisa waktu ${match.remaining} detik`}
              >
                {match.remaining}
                <small>detik</small>
              </div>
            </div>
            <div className="demo-question-progress" aria-hidden="true">
              <span style={{ width: `${((match.index + 1) / demoQuestions.length) * 100}%` }} />
            </div>
            <div className="demo-opponent-status">
              <span className="demo-avatar peach">R</span>
              <span>
                <strong>Raka · lawan demo</strong>
                <small>
                  {match.opponentAnswered
                    ? 'Sudah menjawab'
                    : match.phase === 'resolved'
                      ? 'Waktu habis'
                      : 'Sedang menjawab…'}
                </small>
              </span>
              <span className="demo-pill">{difficultyLabels[match.difficulty].toUpperCase()}</span>
            </div>
            <p className="demo-question-label">SOAL MATEMATIKA · FIXTURE DEMO</p>
            <h3 className="demo-question-text">{question.prompt}</h3>
            <div className="demo-options" role="group" aria-label="Pilihan jawaban">
              {question.options.map((option, index) => (
                <button
                  type="button"
                  key={`${match.index}-${index}`}
                  className={`demo-option ${match.selected === index ? 'is-selected' : ''}`}
                  disabled={match.locked || match.phase === 'resolved' || match.disconnected}
                  aria-pressed={match.selected === index}
                  onClick={() => dispatch({ type: 'select', option: index })}
                >
                  <span>{letters[index]}</span>
                  {option}
                  {match.selected === index && (
                    <strong className="demo-option-check">Dipilih</strong>
                  )}
                </button>
              ))}
            </div>
            {match.phase === 'question' ? (
              <div className="demo-question-footer">
                <p role="status">
                  {match.locked
                    ? 'Jawaban terkunci. Menunggu lawan demo atau waktu habis.'
                    : 'Pilih satu jawaban lalu kirim.'}
                </p>
                <button
                  className="demo-button"
                  type="button"
                  disabled={match.selected === null || match.locked || match.disconnected}
                  onClick={() => dispatch({ type: 'submit' })}
                >
                  Kirim jawaban
                </button>
              </div>
            ) : (
              <div className="demo-question-footer">
                <p role="status">
                  Soal selesai.{' '}
                  {match.selected === null
                    ? 'Tidak ada jawaban yang dikirim.'
                    : 'Pilihan Anda sudah tercatat untuk demo.'}
                </p>
                <button
                  className="demo-button"
                  type="button"
                  disabled={match.disconnected}
                  onClick={() => dispatch({ type: 'next' })}
                >
                  {match.index === demoQuestions.length - 1
                    ? 'Lihat hasil demo'
                    : 'Soal berikutnya'}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </section>
          <aside className="demo-card demo-card-pad demo-match-aside">
            <h2 className="demo-section-title">Status pertandingan</h2>
            <p className="demo-section-note">Pratinjau antarmuka, bukan sesi realtime.</p>
            <div className="demo-match-stat">
              <span>Anda</span>
              <strong>{match.submittedCount} jawaban terkirim</strong>
            </div>
            <div className="demo-match-stat">
              <span>Lawan demo</span>
              <strong>{match.opponentAnswered ? 'Sudah menjawab' : 'Menunggu'}</strong>
            </div>
            <div className="demo-match-stat">
              <span>Durasi soal</span>
              <strong>{durations[match.difficulty]} detik</strong>
            </div>
            <button
              className="demo-button demo-button-secondary mt-5 w-full"
              type="button"
              disabled={match.disconnected}
              onClick={() => dispatch({ type: 'disconnect' })}
            >
              Simulasikan koneksi putus
            </button>
            <p className="demo-section-note mt-3">
              Timer soal tetap berjalan saat simulasi koneksi putus.
            </p>
          </aside>
          {match.disconnected && (
            <div className="demo-reconnect" role="alert">
              <span className="demo-metric-icon peach" aria-hidden="true">
                ⌁
              </span>
              <h2>Koneksi terputus · simulasi</h2>
              <p>
                Dalam PvP nyata, pemain memiliki 20 detik untuk kembali. Waktu soal tetap berjalan.
              </p>
              <strong>{match.reconnectLeft} detik tersisa</strong>
              <button
                className="demo-button mt-5"
                type="button"
                onClick={() => dispatch({ type: 'reconnect' })}
              >
                Sambung ulang demo
              </button>
            </div>
          )}
        </div>
      )}

      {match.phase === 'result' && (
        <section className="demo-card demo-result-card">
          <span className="demo-result-star" aria-hidden="true">
            {match.outcome === 'completed' ? '★' : '⌁'}
          </span>
          <span className="demo-pill">HASIL SIMULASI</span>
          <h2>
            {match.outcome === 'completed'
              ? 'Duel demo selesai!'
              : 'Jendela sambung ulang berakhir'}
          </h2>
          <p>
            {match.outcome === 'completed'
              ? `Anda mengirim ${match.submittedCount} jawaban dari 10 soal demo.`
              : 'Ini hanya pratinjau forfeit; tidak ada rekor yang diperbarui.'}
          </p>
          {match.outcome === 'completed' && (
            <div className="demo-example-score">
              <span>
                Naya <strong>850</strong>
              </span>
              <small>contoh skor, tidak dihitung dari jawaban Anda</small>
              <span>
                Raka <strong>760</strong>
              </span>
            </div>
          )}
          <p className="demo-section-note">
            Tidak ada hasil, XP, atau peringkat yang disimpan. Penilaian PvP nyata akan dilakukan
            oleh NestJS.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              className="demo-button"
              type="button"
              onClick={() => dispatch({ type: 'reset' })}
            >
              Main lagi
            </button>
            <Link className="demo-button demo-button-secondary" href="/demo/leaderboards">
              Lihat leaderboard demo
            </Link>
          </div>
        </section>
      )}
      <p className="demo-footnote">
        Kode room, lawan, dan pertanyaan adalah fixture fiktif. Undangan kelas, QR, serta aturan
        OPEN-07 menunggu implementasi produk yang terhubung.
      </p>
    </div>
  );
}
