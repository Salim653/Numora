# Pemulihan integrasi dan rencana menuju MVP — 1 Oktober 2026

**Status:** fondasi integrasi diperbaiki di branch `fix/mvp-integration-audit`. Seluruh modul PRD belum selesai. Dokumen ini melanjutkan [audit awal](MVP0_INTEGRATION_AUDIT_2026-09-30.md), membedakan hasil teruji dari pekerjaan dan keputusan yang masih diperlukan.

Perubahan dipublikasikan sebagai [draft PR #17](https://github.com/ayiinee/Numora/pull/17). `main` belum diubah; integrasi ke branch utama menunggu review tim.

## 1. Mandat dan aturan yang tetap berlaku

- **ENGINEERING DECISION:** koordinator mengonfirmasi `Numora-Staging` (`pkamenfnwmoeisccnrnk`) adalah sandbox development, mengizinkan uji/data demo, lalu meminta perbaikan aman dilakukan langsung jika memungkinkan.
- **PRD RULE:** target produk mengikuti PRD v0.5, termasuk mastery Drill 80%, otorisasi server, versi konten historis, dan batas afiliasi.
- **OPEN:** [OPEN_DECISIONS.md](../product/OPEN_DECISIONS.md) tetap berlaku. Perbaikan ini tidak menetapkan formula XP final, placement Pretest, konfigurasi Tryout/IRT, atau hasil edge PvP yang belum disetujui.
- Sasaran koordinator adalah seluruh modul PRD end-to-end. Demo UI dan CI hijau belum memenuhi sasaran itu. Tidak ada jaminan perangkat lunak bebas bug; gate di bawah membantu menemukan regresi sebelum integrasi.

## 2. Perubahan yang dilakukan dan alasannya

| Perubahan | Alasan / batas |
| --- | --- |
| Normalisasi CRLF/LF pada pemeriksa tipe kontrak | Menghilangkan kegagalan semu checkout Windows tanpa mengabaikan perbedaan isi. |
| `env:check`, pemeriksaan ref Auth/DB, port 5432, TLS dan key publik | Mencegah proyek Auth/API/DB berbeda, pemakaian transaction pooler oleh client saat ini, dan salinan service-role key publik. Tidak menguji OAuth pengguna. |
| Integrasi PR #13 pada branch audit | Menyatukan schema v0.5, query konten/Drill/monitoring, pinning versi soal, dan riwayat migrasi. `main` tidak diganti atau di-reset. |
| Fallback judul level dan persistensi `best_stars` | Kolom description boleh null pada model v0.5; API tetap memberi judul. Retry bernilai lebih rendah mempertahankan best score/stars dan unlock. |
| `db:check` sebelum layanan development | Pemeriksaan baca saja atas koneksi, keberadaan 50 definisi tabel/kolom aplikasi, dan RLS. Database fisik memiliki dua tabel tambahan untuk referensi legacy. Bukan audit penuh constraint atau QA domain. |
| Integrasi perubahan PR #15 | Menghindari resolusi sesi ganda dan loading tanpa akhir; tiga tes regresi sesi disertakan. Login Google nyata masih perlu smoke browser. |
| Bridge sandbox dengan backup dan rehearsal | Menambahkan enam tabel kompatibilitas dan mencatat migrasi `0003`; tidak menjalankan DDL penuh `0003` yang akan bertabrakan dengan 46 tabel lama. |
| `db:seed:learning` | Membuat konten demo secara transaksional tanpa menciptakan UUID Auth placeholder. Idempotensi dan pinning versi paket diuji pada database khusus. |
| Validasi JSON Schema dan `test:checks` | Empat schema dikompilasi dengan [Ajv draft 2020-12](https://ajv.js.org/json-schema.html); tipe schema, referensi dan format diuji. Rule payload yang masih umum tidak otomatis menjadi lengkap. |

PR #11 tidak di-merge: basisnya tertinggal, menghapus modul inti, dan operasi administratif yang diperiksa belum menegakkan role Admin. Pekerjaannya tetap tersedia di cabang/worktree asal untuk port selektif. PR #10 sudah direkonsiliasi melalui jalur #13; jangan menggabungkan lagi alternatif migrasi `0003` dari `fix/data-pr10-integration`. PR #16 menambah akses demo dan tidak menyelesaikan domain backend.

## 3. Backup, transisi, dan bukti database

PostgreSQL sementara dijalankan hanya pada loopback port 55432, tanpa Docker atau instalasi service permanen, memakai [binaries EDB](https://www.enterprisedb.com/download-postgresql-binaries). Development sehari-hari tetap memakai cloud.

Verifikasi akhir memakai cluster sementara baru di `D:\numora-pg-audit-20261001` pada loopback port 55433. Cluster awal di Temp dihentikan ketika beberapa berkas alatnya tidak lagi tersedia. Ini penggantian alat uji lokal; tidak ada reset database cloud.

Urutan yang telah dilakukan:

1. `pg_dump` schema `public` dan `drizzle` dari sandbox dalam mode baca saja.
2. Restore arsip ke database PostgreSQL sementara `numora_restored`.
3. Jalankan preflight bridge, apply bridge pada restore, lalu migrator biasa. Migrator tidak mengulang DDL lama.
4. Jalankan tes API pada restore dan pada jalur database kosong; uji upgrade database dengan hasil Drill lama terisi.
5. Terapkan bridge ke sandbox hanya setelah pemeriksaan backup/hash dan rehearsal lolos. Semua tabel public dikunci, jumlah baris sebelum perubahan harus nol, dan batas lock/statement diterapkan. DDL serta catatan migrasi berada dalam satu transaksi.
6. Bandingkan schema aktif dengan database hasil migrasi normal. Nama constraint/index boleh berbeda; definisi constraint dan struktur index dibandingkan. Urutan hasil katalog dinormalisasi agar locale PostgreSQL tidak memberi perbedaan semu.
7. Seed konten belajar demo saja setelah skema sesuai.

Hasil cloud setelah perbaikan:

| Pemeriksaan | Hasil |
| --- | --- |
| Tabel public | 52; 46 tabel lama dipertahankan dan 6 tabel kompatibilitas ditambahkan. |
| Kolom termasuk tipe, nullable, default | 401; cocok dengan database hasil migrasi normal. |
| Definisi constraint | 228; cocok setelah mengabaikan nama/urutan. |
| Struktur index | 139; cocok setelah mengabaikan nama/urutan. |
| RLS | Aktif pada seluruh 52 tabel. |
| Grant tabel public ke `anon`/`authenticated`/`service_role` | 0, sesuai jalur domain melalui API. |
| Riwayat Drizzle | 13 entri; 12 riwayat lama dipertahankan, 1 entri bridge ditambahkan. |
| Konten demo | 1 bab, 1 subbab, 2 level, 2 paket Level 1 × 10 soal; 20 versi/varian. |
| Profil aplikasi | 0; tidak ada Admin/Guru/Siswa palsu yang dibuat. |

Backup dan bukti dipertahankan di luar Git:

```text
D:\numora-sandbox-backups\2026-10-01-mvp-bridge\
  sandbox-public-drizzle-before.dump
  rehearsal-evidence.json
  post-bridge-comparison.json
```

SHA-256 arsip sebelum bridge:

```text
f2d2dc9267b70ef20597d089157e7dc04ac32a2b6a00b8614f8fbc5610f83d5f
```

**Batas backup:** hanya schema/data aplikasi public dan jurnal Drizzle. Auth, Storage, ownership dan ACL cloud tidak termasuk. Ini bukti restore untuk transisi tersebut, bukan backup penuh proyek Supabase. Jangan memasukkan arsip ke Git atau menjalankan restore destruktif ke proyek bersama. Kegagalan bridge di dalam transaksi dibatalkan otomatis; pemulihan pascakomit memerlukan evaluasi data baru dan operator database.

## 4. Bukti pengujian dan batasnya

- Tes API: 21 lulus dengan PostgreSQL nyata, termasuk dua suite integrasi yang sebelumnya dilewati. Identitas pada tes domain memakai fixture/mock; ini tidak menggantikan login Google.
- Tes schema bridge dan seed learning: 2 lulus, termasuk penolakan apply sandbox tanpa flag khusus dan seed berulang tanpa profil palsu.
- Tes web: 16 lulus, termasuk tiga tes regresi sesi Auth.
- Tes guard/kontrak root: 3 lulus, termasuk schema JSON yang salah dan format event tidak valid.
- Jalur database kosong, upgrade hasil Drill lama, dan fixture bridge Staging: lulus. Salinan dari backup cloud asli juga berhasil di-bridge dan lolos tes API.
- Smoke runtime `pnpm dev`: web `/` HTTP 200; API health/database HTTP 200; endpoint identity dan chapters tanpa Bearer ditolak 401.
- Redis/BullMQ: worker tersambung; satu `manual-probe` pada prefix development diproses hingga log completed. Ini hanya antrean bootstrap; job IRT/leaderboard/outbox belum ada.
- CI akhir `pnpm run ci`: lulus setelah alat uji/disk lokal dipulihkan, dengan 42 tes total (21 API, 16 web, 2 database, 3 root checks), termasuk integrasi PostgreSQL yang benar-benar dijalankan. `pnpm openapi:generate` dan pemeriksaan diff OpenAPI lulus. Ini belum E2E seluruh PRD.

### Penghambat perangkat lokal yang ditemukan

Build akhir sempat gagal `ENOSPC` pada drive C:. Arsip unduhan PostgreSQL uji dan artefak `.turbo/cache`/`apps/web/.next` dipindahkan ke D: dan tetap dipertahankan; source code, `.env`, worktree lain, serta database cloud tidak dibersihkan. Penghapusan arsip ditolak automatic approval dengan alasan `blocked by policy`, sehingga dipilih pemindahan yang mempertahankan berkas. Artefak build lama berada di `D:\numora-build-artifacts\2026-10-01-mvp-recovery`; arsip binaries berada bersama backup sandbox. Cache baru dapat dibuat ulang oleh tooling. Kapasitas drive tetap perlu dipantau saat menjalankan build berikutnya.

Tes guard CLI kini menyediakan timeout 20 detik untuk proses TypeScript baru dengan batas child 15 detik, agar startup di Windows saat runner paralel tidak melampaui timeout default 5 detik. Penggantian alat PostgreSQL lokal menangani `ECONNRESET` dari berkas runtime Temp yang hilang; koneksi sandbox tidak terdampak.

Layanan smoke development dan PostgreSQL sementara dihentikan setelah verifikasi. Koordinator mengonfirmasi tiga akun Google khusus sandbox **belum tersedia**; login/callback dan alur tiga peran di browser belum dapat dibuktikan.

## 5. Urutan pekerjaan menuju seluruh PRD

Tabel ini adalah **PROPOSED urutan engineering**, bukan perubahan target atau janji tanggal selesai. Gunakan [PRD_MAPPING.md](../product/PRD_MAPPING.md) dan batas modul saat membuat backlog.

| Urutan | Pekerjaan konkret | Bukti selesai | Dependency |
| --- | --- | --- | --- |
| 1 | Sediakan tiga akun Google sandbox; provision Admin ke Auth UUID nyata; Guru/Siswa daftar melalui UI/API; periksa callback localhost | Admin membuat sekolah/token → Guru verifikasi/buat kelas → Siswa join/Drill → Guru melihat progres; akses silang ditolak | Akun Google belum tersedia; pilihan akun Admin oleh koordinator/operator. |
| 2 | Review branch integrasi dan pastikan setiap pengembang memakai commit/schema yang sama | PR lint/typecheck/test/build/contract hijau; smoke ulang setelah merge; runbook migrasi dipahami | Git push dry-run berhasil melalui credential helper yang sudah tersedia. Branch dipublikasikan untuk draft review; `main` tetap memerlukan review tim sebelum merge. |
| 3 | Port Admin konten/laporan dari PR #11 secara selektif; pertahankan Identity/Class/Drill/Monitoring dan schema v0.5 | Endpoint berotorisasi Admin, input valid, perubahan versi non-destruktif, UI terhubung, akses negatif dan hasil lama tetap benar | Review modul; konten Curriculum. UI preview belum dihitung selesai. |
| 4 | Lengkapi kontrak asesmen/history; implementasikan Pretest dan Tryout dalam engine durable | 20 soal Pretest, sekali selesai per bab; Tryout satu attempt/paket, rilis WIB, hasil menunggu IRT; kontrak FE/BE sama | OPEN-01–05, OPEN-18; distribusi/placement dan paket resmi oleh Curriculum/Research/PO. |
| 5 | XP ledger, worker outbox/IRT, feedback, video dan pelaporan | Idempotensi ledger/job; minimal 30 respons IRT; Teacher hanya siswa sendiri; feedback satu arah dan state dibaca; referensi versi laporan/video | OPEN-10–12/18; konten video serta model IRT oleh pemilik. Infrastruktur generik bisa dikerjakan sekarang. |
| 6 | PvP WebSocket dan leaderboard dari data server | Match/timer/skor/reconnect 20 detik otoritatif; hasil durable; XP kelas terpisah PvP; update/reset/archive WIB | OPEN-07, OPEN-11; demo lokal belum backend. |
| 7 | E2E lintas peran, retry/network failure, backup/restore dan uji beban sesuai scope release | Seluruh acceptance criteria PRD dan otorisasi lulus; bukti QA dapat diulang | OPEN-09 dan scope real-user staging terpisah. |

Untuk tiap modul, kerjakan kontrak/authorization/persistence dan tes backend sebelum menganggap UI terhubung. Jangan membuat lagi tipe response final berbeda dari OpenAPI atau memindahkan scoring/progress ke React. Keputusan akademik OPEN harus dicatat oleh pemiliknya sebelum perilaku final diterbitkan.

## 6. Cara lanjut development

```powershell
pnpm install --frozen-lockfile
pnpm env:check
pnpm db:check
pnpm dev
```

Jangan menjalankan kembali bridge, seed penuh profil palsu, atau migrasi alternatif `0003` untuk mencoba memperbaiki kegagalan runtime. Untuk konten demo pada sandbox kosong yang sudah direkonsiliasi, mode learning-only tetap membutuhkan guard seed eksplisit. Untuk E2E yang belum diuji, siapkan akun nyata dan jalankan QA tiga peran.

Branch ini menyelesaikan fondasi koneksi/skema dan beberapa regresi. Modul server yang belum ada memerlukan implementasi fitur; penyelesaiannya tidak terjadi hanya dengan merge, reset password, atau mengganti `.env`.
