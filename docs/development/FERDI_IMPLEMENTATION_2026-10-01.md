# Progress implementasi Ferdi — 1 Oktober 2026

> **Konteks historis/provisional:** bukti dan rancangan di bawah dipertahankan pada tanggal pencatatannya. Aturan Core Learning yang berbeda telah digantikan oleh [PRD Drill v1.2 / TryOut v1.1, 2 Oktober 2026](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md); hasil tes lama tidak membuktikan acceptance terbaru.

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

- Audit ulang: `pnpm run ci` **lulus** di worktree terpisah dengan PostgreSQL nyata: 74 tes (3 root, 2 database, 40 API, 29 web), validasi kontrak, generated types, lint, typecheck, dan production build. Bukti lokal tersimpan di `D:\numora-ferdi-tests-20261001\audit-ci-final.log`; ini verifikasi gabungan tiga branch, sedangkan CI setiap PR tetap menjadi gate review tersendiri. Verifikasi awal 63 tes dipertahankan pada log `ci-final.log`.
- Database kosong dimigrasi sampai 0004; upgrade dengan hasil Drill lama dan rehearsal fixture bridge diikuti migrasi terbaru lulus. Jumlah migrasi pada pemeriksa bridge mengikuti jurnal canonical.
- Worker Vitest API/web dibatasi dua per package untuk menghindari overload proses pada regresi paralel Windows. Dua tes lama sempat mencapai timeout 5 detik saat semua worker berjalan; pengujian terpisah dan regresi dengan batas worker lulus.
- `pnpm openapi:generate` dan `pnpm contracts:types:check` **lulus**; hasil regenerasi OpenAPI identik dengan kontrak yang dikomit. Generated types pada dua branch awal juga diperiksa terhadap kontrak masing-masing. Bukti ini bukan OAuth Google atau acceptance staging sekolah.

Pada audit awal, migrasi 0004 hanya di-rehearsal pada database lokal khusus pengujian. Pemulihan startup sandbox yang kemudian diminta pengguna tercatat di bagian berikut; database deployment tetap mengikuti prosedur operator.

Temuan, perbaikan, dan batas bukti audit ulang tercatat di [FERDI_AUDIT_2026-10-01](FERDI_AUDIT_2026-10-01.md). Automation browser lingkungan belum dapat dibuka; pemeriksaan HTTP/React bukan pengganti E2E login Google dan acceptance lintas peran oleh QA.

## Pemulihan `pnpm dev`

**ENGINEERING RECOVERY, 1 Oktober 2026:** setelah pengguna meminta solusi dijalankan, sandbox development terverifikasi dibackup dan dimigrasi sampai `0005_irt_metadata_cursor_recovery`. Tiga kolom IRT belum ada, sementara timestamp riwayat legacy lebih tinggi daripada 0004 sehingga migrator melewatinya. Migrasi koreksi memakai `IF NOT EXISTS`, mempertahankan riwayat lama, dan tidak menimpa metadata pada jalur yang sudah menjalankan 0004.

- `DATABASE_MIGRATION_URL` kosong; URL runtime yang telah diverifikasi cocok dengan sandbox dan memiliki ownership tabel hanya diteruskan sebagai variabel proses migrasi sementara. `.env` tidak diubah dan fallback tidak dimasukkan ke script aplikasi.
- Backup public/drizzle, hash, bukti histori sebelum/sesudah, dan log pengujian berada di `D:\numora-ferdi-migration-20261001`. Backup ini tidak mencakup Auth/Storage atau ACL proyek.
- Uji upgrade, bridge dengan cursor legacy, dan migrasi berulang lulus. `pnpm run ci` kembali lulus dengan 74 tes.
- `pnpm db:check` sandbox lulus: 50 definisi tabel/kolom aplikasi hadir dan RLS aktif.
- `pnpm dev` berhasil: web `/`, API health, dan database health HTTP 200; worker terhubung ke Redis. Identity dan Admin IRT tanpa sesi ditolak 401. Ini smoke startup, bukan E2E Google atau acceptance seluruh PRD.
- Proses development yang dibuat untuk smoke dihentikan setelah pemeriksaan, sehingga pengguna dapat menjalankan `pnpm dev` dari terminal sendiri.

## Batas kesiapan

Implementasi lokal/fixture tidak membuktikan login Google, review akademik, deployment, atau acceptance seluruh PRD. OPEN tetap terbuka sampai pemilik mencatat persetujuan. Batch IRT SUCCEEDED tidak otomatis membuka hasil Tryout. Fitur yang menunggu kontrak anggota lain tetap dicatat sebagai dependensi, bukan diganti dengan aturan frontend.
