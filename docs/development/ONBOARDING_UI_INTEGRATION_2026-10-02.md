# Rekonsiliasi onboarding dan UI pada PR #29

**ENGINEERING DECISION — 2 Oktober 2026:** pemilik meminta perluasan PR gabungan #29 dengan #26 → #27 → #28. Merge commits mempertahankan head asal. #21 di luar cakupan; review dan merge main tetap mengikuti gate GitHub.

## Backend dan kompatibilitas

- Runtime Learning, pin versi historis, layanan konten/support/IRT, worker, dan jalur migrasi 0000–0009 dari integrasi sebelumnya tetap authoritative. Service Learning legacy dan route demo tidak dipulihkan. Tidak ada migrasi schema tambahan dari integrasi onboarding/UI ini.
- Token guru baru: delapan karakter dari alphabet tanpa karakter ambigu, HMAC-SHA256 pada bentuk uppercase, disimpan sebagai `hmac-v1:<digest>`. Hash SHA-256 legacy diverifikasi dengan kapitalisasi asli. Token pendek HMAC tanpa penanda dari #26 didukung dengan pepper yang sama. Tidak ada rewrite hash/timestamp atau invalidasi massal.
- **PRD RULE:** token guru valid 72 jam, hanya digunakan sekali, dan konsumsi/revoke/reissue berada dalam transaksi. `createdAt` dan `expiresAt` memakai waktu penerbitan yang sama. Collision retry hanya untuk unique index token; reissue rollback mempertahankan token asal ketika penerbitan gagal.
- **ENGINEERING DECISION:** kode kelas baru enam karakter; API tetap menerima kode legacy/QA 8–32 karakter termasuk `-`/`_`. Kode kelas dibagikan dan reusable oleh beberapa siswa. Klaim single-use kode kelas di deskripsi #26 tidak cocok dengan implementasi; single-use berlaku pada token verifikasi guru. Constraint satu kelas aktif per siswa, join berulang, pemeriksaan sekolah/verifikasi guru dalam transaksi, dan audit dipertahankan.
- Rate limit HTTP: lima permintaan verifikasi per akun guru/sekolah per 60 detik; sepuluh join per akun siswa per 60 detik. Semua format kode memakai quota yang sama, setelah autentikasi/role check. Lua Redis melakukan INCR/TTL secara atomik; `429 application/problem+json` memuat `Retry-After`, outage menghasilkan `503` sebelum mutasi. Quota hanya state ephemeral; token dan membership tetap PostgreSQL.
- Input tempelan dipangkas spasi pada tepi tanpa mengubah kapitalisasi token legacy; tes UI mencakup format pendek dan legacy.
- Token DTO: format pendek delapan karakter atau legacy base64url 32–128 karakter. Kode kelas DTO: enam karakter alfanumerik atau legacy base64url/QA 8–32 karakter. OpenAPI/types diregenerasikan. Riwayat canonical menambahkan `isDemo` dari metadata package agar UI memberi label berdasarkan data, bukan asumsi.

## UI dan batas produk

- Shell, tokens, komponen, font Inter lokal beserta lisensi, dan layout responsif mengikuti #28. Provider Student hanya di layout, dengan cache berdasarkan `profile.id`, dibuang saat logout/pergantian akun. Teacher, formulir verifikasi, dan state lokal Admin memakai key identitas yang sama; refresh token pada akun yang sama tidak memutus cache.
- Dashboard memakai `/students/me/dashboard` untuk kelas/sekolah, progres, skor, aktivitas dan active Drill. Mobile memiliki Beranda/Belajar/Tryout/Progres/Profil; desktop dan dashboard menyediakan PvP/peringkat. Focus mode menghapus navigasi saat asesmen. CSS shell lama dibuang; style fitur canonical PvP/peringkat dipertahankan terpisah.
- Pagination histori, Pretest record tanpa link hasil yang belum tersedia, save/retry/resume/submit, batas pembahasan, laporan soal/video idempotent, lanjut level, dan status Tryout/IRT tetap memakai kontrak canonical. Tidak ada nilai XP/streak atau affiliation buatan.
- Workflow QA dari #27 tetap terbatas Development dan proyek yang diizinkan, dengan vault diabaikan Git serta guard seed/backup. Integrasi ini tidak menjalankan provisioning/seed/migrasi terhadap shared cloud. Login produk tetap Google.
- **OPEN:** konfigurasi akademik, identity/handoff final, PvP edges, XP, model/hasil IRT dan kebijakan rilis tetap mengikuti register OPEN. Tidak ada kebijakan produk baru yang disimpulkan dari redesign.

## Environment dan rollout

Sediakan `TEACHER_TOKEN_PEPPER` pada API sebelum menjalankan head ini; startup gagal jika kosong atau secret diekspos sebagai `NEXT_PUBLIC_TEACHER_TOKEN_PEPPER`. Gunakan secret acak setidaknya 32 byte, server-only, terpisah per environment dan stabil lintas replica. Jika #26 sudah menerbitkan token pendek, gunakan nilai pepper yang sama. Jangan mengganti pepper saat token pendek masih valid: tunggu periode 72 jam sejak penerbitan terakhir atau reissue token melalui alur Admin. Pepper nyata tidak masuk Git; nilai CI/Vitest hanya fixture.

Redis TCP/TLS wajib untuk dua endpoint kode; `BULLMQ_PREFIX` memisahkan quota antar environment/developer. Plain Redis hanya diizinkan pada localhost saat `NODE_ENV=test`. Ekspor OpenAPI tidak membuka koneksi Redis. Rehearsal upgrade/bridge tetap memakai jalur migrasi #29; snapshot/jurnal historis tidak dinomori ulang.

## Validasi

Suite mencakup kompatibilitas SHA-256/HMAC, single-use/race/expiry/revoke, reissue rollback/collision, kode kelas reusable dan race satu kelas, DTO HTTP, 429/Retry-After/503, serta quota/expiry lintas instance Redis. Regresi Learning/IRT/authorization yang telah ada tetap dijalankan. Tes browser memakai fixture terisolasi untuk Student 320/390/768/1440 px; ini bukan bukti Google OAuth live.

Pemeriksaan lokal selesai: lint dan seluruh workspace typecheck/build lulus; empat tes root serta validasi empat JSON Schema dan freshness generated types lulus. Suite PostgreSQL terisolasi lulus: delapan tes database, 65 API, 37 web, dan empat worker. Lima tes Redis (empat transport PvP dan satu quota kode lintas instance) hanya dijalankan dengan service Redis nyata di CI.

Ketiga belas tes Chromium lulus: Student 320/390/768/1440 px dengan save/resume/submit, join kode baru/legacy dan identity refresh, demo 404, Teacher/Admin mobile/desktop, login Google tanpa tautan demo yang dihapus, serta verifikasi token baru/legacy tanpa perubahan kapitalisasi. Browser exceptions diperiksa. Upgrade legacy Drill dan bridge baseline sandbox lulus di database lokal; direktori SQL/snapshot/jurnal migrasi tidak berubah dari head integrasi sebelumnya. Ekspor OpenAPI diregenerasikan dari aplikasi gabungan. Pemeriksaan berat dijalankan bertahap setelah percobaan paralel kehabisan memori pada laptop Windows.

Workflow CI sekarang juga menjalankan browser E2E. Status CI/review terbaru tercatat di [PR #29](https://github.com/ayiinee/Numora/pull/29); CI sebelum perluasan tidak memvalidasi perubahan ini. CI pada head terbaru dan review Code Owner menjadi gate merge. QA Google OAuth dan acceptance Admin → Guru → Siswa di staging tetap gate sebelum rilis.
