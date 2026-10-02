# Audit integrasi MVP 0 — 30 September 2026

Catatan historis: audit ini menggambarkan kondisi 30 September 2026. Implementasi berikutnya dan penghapusan route pratinjau dicatat di [status area siswa](STUDENT_AREA_IMPLEMENTATION.md).

**Status:** audit berjalan. Dokumen ini mencatat bukti pada `main` commit `a74ca07`, pemeriksaan lokal 30 September 2026, dan pemeriksaan ulang cloud **1 Oktober 2026 WIB** setelah password database direset. Hasil cloud dapat berubah. Jangan menafsirkan CI hijau sebagai bukti alur pengguna end-to-end.

**Pembaruan pemulihan, 1 Oktober:** perbedaan skema di bawah adalah bukti **sebelum perbaikan**. PR #13 dan perbaikan sesi PR #15 kini terintegrasi di branch `fix/mvp-integration-audit`; sandbox berhasil direkonsiliasi setelah backup/restore dan pengujian. Skema aktif memiliki 52 tabel, kolom/tipe/nullability/default serta definisi constraint/index cocok dengan jalur migrasi baru. Status terkini dan pekerjaan tersisa dicatat di [MVP_RECOVERY_2026-10-01.md](MVP_RECOVERY_2026-10-01.md). `main` dan status PR asal belum diubah.

**Target yang diklarifikasi koordinator:** seluruh modul PRD v0.5 harus berjalan end-to-end, bukan hanya demo UI. Koordinator juga mengonfirmasi proyek bernama `Numora-Staging` saat ini dipakai sebagai **sandbox development**. Nama tersebut bertabrakan dengan istilah *staging* untuk uji sekolah dalam [ENVIRONMENTS.md](ENVIRONMENTS.md); sebelum memakai akun siswa/guru sungguhan, siapkan lingkungan uji sekolah terpisah.

## Temuan penghambat

| Prioritas | Temuan dan bukti | Dampak | Tindakan |
| --- | --- | --- | --- |
| P0 | `.env` awalnya memakai proyek Supabase berbeda antara browser dan API/DB. Penyelarasan lokal terakhir membuat `pnpm env:check` lulus; penyimpanan dari buffer editor lama pernah mengembalikan nilai yang salah. | Token Auth browser dari proyek lain ditolak API. | Pertahankan URL dan publishable key web/API dari proyek yang sama pada tiap mesin; muat ulang `.env` di editor sebelum menyimpan lagi. Jalankan `pnpm env:check` sebelum `pnpm dev`. |
| Pulih (sebelumnya P0) | Sebelumnya pooler ditolak dengan `28P01` dan host Direct connection tidak ter-resolve (`ENOTFOUND`). Pada 1 Oktober, setelah reset password dan pembaruan `.env`, koneksi pooler port 5432 dengan `sslmode=require`, `SELECT 1`, dan fungsi health database aplikasi semuanya berhasil. Supabase Auth health/settings HTTP 200, Google aktif, Redis `PING` → `PONG`. | Blokir autentikasi PostgreSQL sudah teratasi. Health koneksi belum membuktikan kompatibilitas query domain atau callback OAuth. | Pertahankan konfigurasi ini. Lanjutkan rekonsiliasi skema dan QA domain; jangan bagikan URL di chat atau Git. |
| P0 | Katalog cloud kini terverifikasi langsung: 46 tabel public, 12 entri migrasi; **11 dari 19 definisi tabel aplikasi** memiliki tabel/kolom yang belum tersedia. `chapters` memakai `name/display_order/status`, sementara kode memakai `title/sort_order/published_at`. Query baca dengan kolom kode gagal `42703`. Empat tabel Drill belum ada. | Koneksi berhasil tetapi query konten/Drill tetap gagal saat runtime. | Rekonsiliasi kode, skema, dan riwayat migrasi. Gunakan rencana bridge PR #13 pada salinan hasil restore lebih dulu; jangan menjalankan migrasi `0003` langsung pada database 46 tabel. |
| P0 | API `main` hanya mendaftarkan Health, Identity, Schools, Classes, Learning/Drill, dan Monitoring. Tidak ada controller Pretest, Tryout, PvP, leaderboard, feedback, atau IRT. Worker hanya memproses antrean `bootstrap`. | Sebagian besar target seluruh PRD belum punya alur server dan persistensi. | Pecah menjadi kontrak, domain service, migrasi, FE, dan QA per modul. Tentukan urutan serta pemilik lintas tim. Jangan menghitung pratinjau lokal sebagai fitur end-to-end. |
| P0 | PR #11 menambah controller Admin/Content/Reports tanpa pemeriksaan Bearer role Admin pada operasi yang diperiksa; contoh `POST /admin/chapters` langsung memanggil service. Cabang itu juga menghapus modul identitas dan Drill saat dibandingkan dengan `main`. | Merge langsung dapat membuka mutasi administratif tanpa otorisasi dan memutus alur inti. | Port selektif hanya setelah memasang autentikasi/otorisasi server, tes akses ditolak, dan mempertahankan modul `main`. |
| P0 | Dua tes integrasi PostgreSQL lokal dilewati ketika `TEST_DATABASE_URL` tidak tersedia. `pnpm run ci` lokal lulus setelah regenerasi tipe, tetapi tidak menguji cloud. Seed memakai Auth UUID placeholder dan tidak menciptakan akun Google. | Alur Admin → Guru → Siswa → Drill belum terbukti memakai identitas nyata. | Jalankan tes pada database uji khusus yang dimigrasi; siapkan akun Auth sandbox dan profil Admin/Guru/Siswa yang benar; jalankan smoke UI/API dengan akses silang negatif. |
| P1 | `pnpm contracts:types:check` gagal pada checkout Windows karena CRLF/LF meski `git diff` isi kosong. | `pnpm run ci` berhenti sebelum lint/test/build. | Pemeriksa tipe kini menyamakan akhir baris; uji CRLF berhasil. |
| P1 | `.env` sempat berisi `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. Tidak ada pemakaian variabel itu dalam kode dan tidak ada bukti kunci pernah masuk bundle, tetapi prefix publik berbahaya. | Salah pakai berikutnya dapat mengekspos kunci berhak tinggi. | Salinan publik sudah dihapus lagi dari `.env` lokal; `env:check` menolaknya jika muncul lagi. |
| P1 | `scripts/validate-contracts.mjs` hanya menjalankan `JSON.parse` atas empat berkas kontrak. | Nama gate memberi kesan validasi skema/kompatibilitas yang belum ada. | Tambah validasi skema dan contoh payload setelah FE/BE/QA menyepakati kontrak modul yang belum terimplementasi. |

## Status modul pada `main`

| Modul PRD v0.5 | Bukti implementasi | Status audit |
| --- | --- | --- |
| Google Auth, profil, sekolah/token, kelas | Controller/API dan UI tersedia. | Terimplementasi dalam kode; cloud E2E belum lolos. Admin memerlukan profil yang diprovisikan operator. |
| Drill dan monitoring Guru | Controller, service, UI, seed demo, tes unit/integrasi tersedia. | Terimplementasi dalam kode; tes PostgreSQL lokal dilewati. Skema sandbox sudah diperiksa 1 Oktober dan belum cocok dengan kode. Ambang PRD 80% sudah dipakai. |
| Pretest | Tidak ada controller atau UI alur asesmen Pretest. | Belum terimplementasi; distribusi/placement masih OPEN-01–03. |
| Tryout dan Penilaian | UI memakai tipe/endpoint yang diberi label PROPOSED; controller Backend belum ada. | Belum end-to-end; spesifikasi resmi OPEN-04/05 dan rilis hasil IRT OPEN-18. |
| PvP dan leaderboard | Halaman pratinjau PvP dan peringkat memakai state lokal. Tidak ada gateway WebSocket atau service skor/leaderboard di `main`. | Hanya demo UI, belum end-to-end. |
| Admin konten, laporan, IRT | Sebagian kode ada di PR #11, bukan `main`; cabang itu mengganti/menghapus modul Auth, Class, Drill, dan Monitoring yang sudah ada. | Perlu port selektif dan tes otorisasi; PR #11 tidak aman di-merge langsung. |
| Worker, XP, analitik, feedback, video | Schema/konsep sebagian tersedia; worker aktif hanya `bootstrap`, belum ada proses domain untuk IRT, outbox, leaderboard. | Belum end-to-end. XP final masih OPEN-11. |

## PR dan cabang yang perlu keputusan integrasi

Snapshot GitHub API 30 September 2026: PR terbuka #10, #11, #13, #15, #16. Status `mergeable` hanya menunjukkan konflik Git pada saat query, bukan kelayakan produk.

| PR | Status Git | Penilaian integrasi |
| --- | --- | --- |
| [#10 — skema v0.5](https://github.com/ayiinee/Numora/pull/10) | `dirty` | Riwayat migrasi bertabrakan dengan `main`; rekonsiliasi sudah dikerjakan di #13. Jangan merge apa adanya. |
| [#11 — Admin/Content](https://github.com/ayiinee/Numora/pull/11) | `dirty` | Basis cabang tertinggal, diff menghapus alur inti, dan controller Admin/Content/Reports yang diperiksa belum menegakkan role Admin. Port modul baru secara selektif dengan Auth/otorisasi saat ini, lalu uji akses negatif. |
| [#13 — skema Staging + Drill](https://github.com/ayiinee/Numora/pull/13) | `clean` | Cabang memuat bridge dan penyesuaian Drill. Dokumentasinya sendiri melarang migrasi `0003` langsung pada Staging 46 tabel. Review pada salinan restore dan uji data historis dahulu. |
| [#15 — sesi Auth](https://github.com/ayiinee/Numora/pull/15) | `clean` | Mengatasi pemeriksaan sesi yang macet; kandidat review/merge lebih awal, lalu smoke OAuth. |
| [#16 — akses demo](https://github.com/ayiinee/Numora/pull/16) | `clean` | Memudahkan melihat demo tanpa backend, tetapi tidak menutup target end-to-end. |

Cabang remote lama `feat-onboardingv1`, `feat-monitoringv1`, `fix/supabase-dep`, `feat/core-learning-web`, `fix/teacher-monitoring-review`, dan sebagian besar `chore/*` sudah menjadi nenek moyang `main`; jangan mengintegrasikan ulang hanya karena cabangnya masih ada. `feat/PvP-Leaderboard` dan `fix/data-pr10-integration` masih punya commit unik; audit diff dan pemiliknya sebelum dipilih. Jangan menghapus cabang atau worktree dalam audit ini.

`fix/data-pr10-integration` dan PR #13 sama-sama mengusulkan migrasi nomor `0003` dengan isi/skema berbeda. Pilih satu jalur migrasi hasil rekonsiliasi; menggabungkan kedua riwayat tersebut tanpa audit database akan merusak kesesuaian Drizzle dan database aktif.

## Urutan pemulihan

1. **ENGINEERING DECISION, koneksi pulih 1 Oktober:** `DATABASE_URL` dan health database berhasil; pemeriksaan metadata baca saja membuktikan skema fisik belum cocok dengan kode. Rekonsiliasi skema sebelum seed/migrasi.
2. **ENGINEERING DECISION, perlu review database:** uji bridge PR #13 pada salinan hasil restore, jalankan migrasi normal pada database kosong, serta tes integrasi dengan data Drill lama. Catat perbedaan dan rollback sebelum menerapkan ke sandbox bersama.
3. **PRD RULE:** buktikan alur Admin → Guru → Siswa → Drill → progres Guru, termasuk 80% unlock, idempotensi, token sekali pakai, serta penolakan akses lintas kelas. Gunakan akun Google sandbox asli dan konten DEMO yang ditinjau Curriculum sebelum uji sekolah.
4. **PROPOSED:** selesaikan PR #15 melalui review; pecah PR #11 menjadi perubahan yang mempertahankan modul inti. Susun kontrak API dan QA sebelum FE untuk Pretest, Tryout/Penilaian, PvP, leaderboard, feedback, Admin/IRT.
5. **OPEN:** keputusan akademik/produk di [OPEN_DECISIONS.md](../product/OPEN_DECISIONS.md) harus diselesaikan pemiliknya untuk perilaku final. Demo yang diberi label jelas dapat menguji wiring tanpa berpura-pura menetapkan aturan final.

Dengan cakupan **seluruh PRD end-to-end**, status repo saat ini tidak mendukung klaim siap minggu depan. Perkiraan harus dibuat ulang berdasarkan modul yang belum ada, keputusan OPEN, kapasitas tim, dan bukti QA; jangan mengubah target menjadi “demo UI” secara diam-diam.

## Pemeriksaan ulang cloud — 1 Oktober 2026 WIB

Pengujian dilakukan memakai `.env` terbaru setelah koordinator mereset password database. Katalog dan hitungan baris dibaca dalam transaksi `READ ONLY`; query kompatibilitas juga baca saja. Tidak ada migrasi, seed, atau perubahan data cloud.

| Pemeriksaan | Hasil |
| --- | --- |
| `pnpm env:check` | Lulus setelah salinan `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` yang muncul kembali dihapus; entri lain termasuk `DATABASE_URL` dipertahankan. |
| PostgreSQL pooler 5432, `sslmode=require` | Terhubung; `SELECT 1` berhasil. |
| `checkDatabaseConnection()` dari build `@tka/database`, yang digunakan health API | Lulus. Ini pengujian fungsi dependensi, bukan smoke HTTP API. |
| Supabase `/auth/v1/health` dan `/auth/v1/settings` | Keduanya HTTP 200; provider Google aktif. Login/callback browser belum diuji. |
| Redis TLS `PING` | `PONG`. Pengujian ini tidak menambahkan job antrean. |
| Katalog database | 46 tabel public; 12 entri `drizzle.__drizzle_migrations`. |
| Tabel aplikasi yang dihitung | `users`, `chapters`, `question_versions`, dan `level_progress` masing-masing 0 baris. Ini bukan hitungan seluruh tabel atau akun Supabase Auth. |

Perbandingan berikut memeriksa **keberadaan tabel dan nama kolom** pada 19 definisi Drizzle kode saat ini. Ini belum memvalidasi seluruh tipe, default, constraint, indeks, atau perilaku tulis. Delapan definisi lain memiliki seluruh nama kolom yang diharapkan; itu belum membuktikan kompatibilitas penuh.

| Tabel | Perbedaan yang terverifikasi |
| --- | --- |
| `chapters` | Tidak ada `title`, `sort_order`, `published_at`. |
| `subchapters` | Tidak ada `title`, `sort_order`, `published_at`. |
| `levels` | Tidak ada `title`, `sort_order`, `published_at`. |
| `questions` | Tidak ada `level_id`, `code`. |
| `question_versions` | Tidak ada `question_id`, `version`. |
| `question_variants` | Tidak ada `question_version_id`, `variant_no`, `stem`, `options`, `correct_option_id`, `explanation`, `is_demo`. |
| `drill_packages` | Tabel belum ada. |
| `drill_package_questions` | Tabel belum ada. |
| `drill_attempts` | Tabel belum ada. |
| `drill_attempt_questions` | Tabel belum ada. |
| `level_progress` | Tidak ada `latest_attempt_id`; database memiliki referensi attempt dengan nama/model lain. |

Reproduksi tanpa membaca data pengguna:

```sql
SELECT "id", "title", "sort_order", "published_at"
FROM "public"."chapters"
LIMIT 0;
-- SQLSTATE 42703: kolom yang diminta tidak tersedia.
```

**Kesimpulan terverifikasi:** reset password memperbaiki autentikasi PostgreSQL. Penghambat konten/Drill berikutnya adalah perbedaan model database dengan kode aplikasi, disertai belum tersedianya data pada tabel yang diperiksa. Rekonsiliasi PR #13 tetap memerlukan pengujian pada salinan restore sebelum perubahan skema sandbox bersama.
