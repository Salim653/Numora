# Progress implementasi Ferdi — 1 Oktober 2026

**ENGINEERING IMPLEMENTATION:** pekerjaan mengikuti pembagian progress pada OWNERSHIP. Target seluruh MVP 12 Oktober tetap target koordinasi; perubahan Ferdi saja tidak menyelesaikan seluruh MVP.

| Pekerjaan                        | Implementasi                                                                                                         | Dependensi acceptance                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| #3 backend paket Drill           | API canonical draf/detail/list/update/publish/archive; guard Admin, transaksi audit, pinning versi, validasi konten. | UI Avicenna; policy dan konsumsi engine canonical Qurotul; review Curriculum.                                       |
| #2 frontend Drill                | Tombol mulai level yang dibuka server, error/retry, serta save/resume/result yang sudah ada.                         | Paket Level 2 dan engine/backend Qurotul.                                                                           |
| #11 laporan/video                | Rekomendasi dari metadata kurasi, API laporan milik Student, frontend hasil/form.                                    | Soal Drill kompatibilitas menunggu migrasi canonical; konten video Curriculum.                                      |
| #9 integrasi IRT                 | Snapshot pseudonim, validasi output, persistence immutable/idempotent, failure state, read-only Admin batch status.  | Review kontrak/model Data, worker Qurotul, OPEN-12/18; belum ada perhitungan statistik atau pelepasan hasil Tryout. |
| #15 dashboard Student            | Afiliasi dari profil API, progres/nilai tersedia, label akademik dan XP terpisah.                                    | Kontrak backend best stars/score, aktivitas dan XP; link/QR tetap Farel/Andi.                                       |
| #8 frontend Tryout               | Layar dan state yang sudah ada dipertahankan.                                                                        | Backend belum menerbitkan endpoint/types final; jangan menyatakan terintegrasi.                                     |
| #12/#13 frontend PvP/leaderboard | Demo tetap terpisah.                                                                                                 | Kontrak gateway/API server belum tersedia; implementasi final menunggu Qurotul.                                     |
| #16 docs                         | Kontrak, status/dependensi dan cara QA diperbarui.                                                                   | Review tim dan bukti staging; handoff visual final belum tersedia.                                                  |

Kontrak lengkap dan acceptance ada di [FERDI_CONTENT_SUPPORT](../api/FERDI_CONTENT_SUPPORT.md). Ownership Pretest/Penilaian, onboarding/monitoring, engine, XP/outbox, dan worker tidak dipindahkan.

## Verifikasi

Suite baru menjalankan HTTP NestJS dengan PostgreSQL nyata dan Auth provider fixture. Suite web memeriksa kegagalan/retry laporan, duplicate submit saat pending, rekomendasi dari server, dan ketergantungan hasil/unlock pada API.

- `pnpm run ci` **lulus** di worktree terpisah dengan PostgreSQL nyata: 63 tes (3 root, 2 database, 34 API, 24 web), validasi kontrak, generated types, lint, typecheck, dan production build. Bukti lokal tersimpan di `D:\numora-ferdi-tests-20261001\ci-final.log`; ini verifikasi gabungan tiga branch, sedangkan CI setiap PR tetap menjadi gate review tersendiri.
- Database kosong dimigrasi sampai 0004; upgrade dengan hasil Drill lama dan rehearsal fixture bridge diikuti migrasi terbaru lulus. Jumlah migrasi pada pemeriksa bridge mengikuti jurnal canonical.
- Worker Vitest API/web dibatasi dua per package untuk menghindari overload proses pada regresi paralel Windows. Dua tes lama sempat mencapai timeout 5 detik saat semua worker berjalan; pengujian terpisah dan regresi dengan batas worker lulus.
- `pnpm openapi:generate` dan `pnpm contracts:types:check` **lulus**; hasil regenerasi OpenAPI identik dengan kontrak yang dikomit. Generated types pada dua branch awal juga diperiksa terhadap kontrak masing-masing. Bukti ini bukan OAuth Google atau acceptance staging sekolah.

Migrasi 0004 hanya di-rehearsal pada database lokal khusus pengujian. Penerapan cloud dilakukan operator Database; layanan development pengguna yang aktif tidak dihentikan oleh pekerjaan ini.

## Batas kesiapan

Implementasi lokal/fixture tidak membuktikan login Google, review akademik, deployment, atau acceptance seluruh PRD. OPEN tetap terbuka sampai pemilik mencatat persetujuan. Batch IRT SUCCEEDED tidak otomatis membuka hasil Tryout. Fitur yang menunggu kontrak anggota lain tetap dicatat sebagai dependensi, bukan diganti dengan aturan frontend.
