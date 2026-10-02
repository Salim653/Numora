# Integrasi area siswa — status dan QA

> **Konteks historis/provisional:** bukti dan rancangan di bawah dipertahankan pada tanggal pencatatannya. Aturan Core Learning yang berbeda telah digantikan oleh [PRD Drill v1.2 / TryOut v1.1, 2 Oktober 2026](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md); hasil tes lama tidak membuktikan acceptance terbaru.


Status: implementasi lokal 1 Oktober 2026; kesiapan rilis tetap membutuhkan review dan QA staging.

## Perubahan

- [x] Layout bersama sidebar/topbar/navigasi enam area dan mobile, berasal dari tampilan prototipe; selector CSS siswa terisolasi.
- [x] Dashboard NestJS; nama, afiliasi, sekolah/kelas, progres, skor Drill, lima aktivitas dan resume dari API.
- [x] Gate Student/QueryProvider satu kali; cache dipisahkan per identitas dan dibuang saat logout/berganti akun.
- [x] Katalog, level, Drill, Tryout dan Penilaian mempertahankan alur backend/autosave/resume/konfirmasi submit.
- [x] Halaman PvP/hasil/leaderboard menggunakan data NestJS, tanpa persona, lawan simulasi atau skor fallback.
- [x] Route pratinjau siswa/PvP/peringkat, simulator frontend dan tautan login dihapus. URL lama 404 tanpa redirect.
- [x] Engine PvP PostgreSQL, gateway Socket.IO, undangan sekelas, cache/job Redis dan recovery cancellation. Kebijakan produksi tetap null.
- [x] Proyeksi best record PvP terpisah dari XP kelas; rekonsiliasi sebelum archive; endpoint top20 dan posisi sendiri.
- [x] Migrasi 0007: versi soal dan scoring policy PvP, waktu pembuatan/expiry, create request ID; backfill historis sebelum NOT NULL/FK.
- [x] Migrasi 0008: request ID undangan dan constraint idempotensi jawaban/undangan.
- [x] OpenAPI, schema WebSocket dan tipe frontend generated diperbarui.

## Batas fitur

**OPEN-07:** pertandingan akun nyata tetap tidak tersedia. Engine hanya diuji melalui injeksi fixture; tidak ada bypass runtime. **OPEN-11:** XP kelas belum diterbitkan; endpoint kelas mengembalikan policyPending. **PROPOSED:** tie rank 1,1,3. OPEN Pretest/Tryout/IRT yang sudah tercatat tetap berlaku; integrasi tampilan tidak menyelesaikan keputusan tersebut.

## Verifikasi lokal

Tes backend memakai PostgreSQL dan Redis lokal khusus tes. Google/Supabase diganti hanya melalui override IdentityService pada Nest test module. Tes browser memakai network/session fixture dalam Playwright; ini membuktikan integrasi UI/kontrak dan responsivitas, bukan login Google atau deployment staging.

### Bukti verifikasi 1 Oktober 2026

| Pemeriksaan | Hasil lokal |
| --- | --- |
| API | Suite lengkap: 42 tes lulus; setelah penambahan tes gate produksi, suite transport PvP: 4 tes lulus. Total kasus API sekarang 43. |
| Web | 20 tes lulus, termasuk cache lintas akun. |
| Database | 2 tes lulus; rehearsal upgrade legacy Drill dan backfill PvP lulus. |
| Worker | 4 tes lulus; rekonsiliasi ulang sebelum arsip juga diverifikasi setelah perbaikan fixture ledger. |
| Script/kontrak | 4 tes script lulus; validasi schema dan pemeriksaan tipe generated lulus. |
| Browser | 4 tes Playwright lulus; lebar 360, 768, 1440 piksel, keyboard, alur Drill, gabung kelas dan URL lama 404. |
| Gerbang repo | Lint, typecheck dan build lulus; tidak ada route pratinjau lama pada manifest build. |
| Skema PostgreSQL uji | Pemeriksaan 50 tabel yang diharapkan, kolom dan RLS lulus. |

Fixture kebijakan PvP tidak disertakan dalam build API produksi. Perbaikan tambahan pada token verifikasi Guru memakai satu acuan waktu untuk `createdAt` dan `expiresAt`, sehingga batas 3×24 jam tetap konsisten saat jam aplikasi dan PostgreSQL sedikit berbeda; tes alur Guru lulus.

```powershell
# Isi dengan URL database dan Redis ISOLASI milik lingkungan tes.
$env:NODE_ENV = 'test'
$env:TEST_DATABASE_URL = '<postgresql test URL>'
$env:TEST_REDIS_URL = '<redis test URL>'
$env:DATABASE_MIGRATION_URL = $env:TEST_DATABASE_URL
pnpm --filter @tka/database db:migrate
pnpm --filter @tka/database db:upgrade-check
pnpm --filter @tka/api test -- --fileParallelism=false
pnpm --filter @tka/worker test -- --fileParallelism=false
pnpm --filter @tka/web test -- --fileParallelism=false
pnpm --filter @tka/web exec playwright install chromium
pnpm --filter @tka/web exec playwright test
pnpm lint
pnpm typecheck
pnpm contracts:validate
pnpm contracts:types:check
pnpm build
```

Playwright menjalankan Next terpisah di port 3300 dengan `.next-e2e`, memeriksa lebar 360/768/1440, keyboard, autosave/resume/submit, gabung kelas dan URL lama 404. Screenshot tersimpan pada `apps/web/test-results` (diabaikan Git). Install browser dapat memakai lokasi cache/TEMP di drive yang cukup ruang. Redis tes lokal tanpa TLS hanya diizinkan saat NODE_ENV=test; development/staging tetap memakai TLS.

## Menjalankan pada database development

Migrasi baru belum diterapkan otomatis ke database bersama. Pastikan `DATABASE_MIGRATION_URL` menunjuk development yang benar dan tidak tertimpa placeholder pada session PowerShell, lalu jalankan:

```powershell
Remove-Item Env:DATABASE_MIGRATION_URL -ErrorAction SilentlyContinue
pnpm db:migrate
pnpm db:check
pnpm dev
```

**PROPOSED:** rollback aplikasi memakai binary/commit sebelumnya dengan skema tambahan tetap ada; jangan menghapus kolom historis/hasil melalui down migration. Rehearsal upgrade membuat database sementara sendiri, memeriksa Drill aktif/selesai dan backfill versi PvP lalu membersihkannya. Deployment rollback ke staging dan tes akun Google nyata tetap gerbang rilis yang belum dibuktikan lokal.

## QA staging yang tersisa

- [ ] Review kode/kontrak dan PR; tinjauan Curriculum untuk konten demo sebelum sekolah.
- [ ] Rehearsal deployment/rollback aplikasi dan migrasi pada staging dengan backup/rekonsiliasi.
- [ ] E2E login Google → gabung kelas → Drill → monitoring Guru memakai akun uji yang disetujui.
- [ ] Review OPEN-07/OPEN-11 serta proposal peringkat seri; jangan aktifkan produksi sebelum persetujuan dicatat di spesifikasi.
- [ ] Observability/alert job gagal dan load test; multi-instance PvP belum didukung.
