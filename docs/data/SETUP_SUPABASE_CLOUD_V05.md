# Setup database Supabase Cloud Numora (PRD v0.5)

**Status (29 September 2026):** Numora-Staging (`pkamenfnwmoeisccnrnk`) sudah memiliki 46 tabel publik dan RLS aktif pada semuanya. Numora-Production belum dimigrasi. Ini adalah baseline struktur data berdasarkan `DATABASE_NUMORA_V05_ACUAN_TIM.md`, bukan implementasi lengkap seluruh aturan bisnis/seed/API.

**Klarifikasi arah integrasi (30 September 2026):** Reyhan menetapkan skema Staging yang diaudit sebagai acuan model database. PR #13 menambahkan migrasi maju `0003` untuk database yang mengikuti riwayat `main` serta menyesuaikan API Drill. Migrasi itu **tidak boleh dijalankan pada Staging yang sudah memiliki 46 tabel acuan**: Drizzle akan mencoba membuat tabel dan enum yang telah ada. Jalur rekonsiliasi Staging memerlukan migrasi aditif tersendiri dan uji pada salinan hasil restore. Lihat [audit detail tujuh tabel Drill](SUPABASE_STAGING_DRILL_AUDIT_2026-09-30.md).

Staging mula-mula menerima sembilan migrasi dari checkout lama (`0000`–`0008`) melalui koneksi Supabase karena `.env` lokal masih mengarah ke `127.0.0.1`. Setelah `origin/main` menambahkan migrasi fondasi resminya, branch ini membangun ulang lanjutan Drizzle sebagai `0001` dan `0002`. Snapshot akhir kedua rangkaian sama untuk 46 tabel; RLS, grant Data API, dan constraint periode diperiksa di Staging. Tiga hash migrasi kanonik branch ini kemudian dicatat sebagai rekonsiliasi **tanpa menjalankan ulang DDL yang sudah ada**. Riwayat Drizzle Staging kini berisi 12 entri: 9 bootstrap awal dan 3 entri kanonik yang hash-nya cocok dengan branch ini. Jangan menghapus sembilan catatan awal. Belum ada seed demo yang dijalankan.

## 1. Simpan target dan kredensial tanpa memasukkannya ke Git

1. Buat proyek Supabase **salinan Staging terpisah** untuk uji restore dan migrasi. Catat Project ID dari URL `https://supabase.com/dashboard/project/<project-ref>`.
2. Di Dashboard proyek salinan, buka **Connect** dan salin connection string **Direct** port `5432` jika jaringan mendukung IPv6. Jika tidak, pilih **Session pooler** port `5432`. Jangan pilih Transaction pooler port `6543` untuk migrasi Drizzle ini. [Panduan koneksi Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).
3. Salin `.env.cloud.example` menjadi `.env.cloud.local`, lalu isi `SUPABASE_PROJECT_REF` dan `DATABASE_MIGRATION_URL` untuk proyek salinan. File `.env.cloud.local` diabaikan Git. Password dalam URL harus di-_URL encode_; gunakan `sslmode=require`.
4. Jangan kirim `DATABASE_MIGRATION_URL`, password, service-role key, atau access token ke chat, issue, PR, atau anggota frontend. URL proyek dan publishable key boleh dipakai web; password DB hanya untuk operator migrasi dan backend/worker yang memerlukan koneksi langsung.

PowerShell dari root repo:

```powershell
Copy-Item .env.cloud.example .env.cloud.local
# Edit .env.cloud.local dengan editor lokal. Jangan commit file ini.
corepack pnpm db:cloud:check
```

Perintah `db:cloud:check` hanya membaca target: memastikan Project ID cocok dengan host/user connection string, TLS diminta, database adalah `postgres`, lalu menampilkan jumlah tabel publik, jumlah tabel tanpa RLS, dan keberadaan riwayat Drizzle tanpa menampilkan password. Perintah ini **belum** membuktikan isi tabel atau kesesuaian seluruh skema.

## 2. Terapkan migrasi yang sudah direview

Belum ada izin menjalankan migrasi pada **Staging asli**. PR #13 menguji jalur `main` pada PostgreSQL kosong dan database berisi data Drill lama. Untuk jalur Staging, `packages/database/src/staging-bridge.ts` memeriksa 46 tabel, RLS, kolom kunci, dan hash migrasi yang diaudit. Skrip menolak Project ID Staging asli. Mode `apply` hanya tersedia untuk database uji lokal atau salinan Staging yang sudah di-restore, dengan `STAGING_COPY_RESTORED=true` pada salinan cloud. Perubahan DDL dan pencatatan hash `0003` berada dalam satu transaksi. Sebelum menjalankan DDL pada Staging asli, operator database tetap harus menyediakan backup yang berhasil diuji restore dan membandingkan hasil salinan dengan kontrak aplikasi. `db:cloud:check` aman dijalankan dalam mode baca.

Rangkaian migrasi historis di branch ini: `0000` membuat 8 tabel fondasi; `0001_lucky_triton` menambah 38 tabel beserta kolom, indeks, FK, dan constraint hingga total 46; `0002_lock_down_numora_data_api` menyalakan RLS dan mencabut akses Data API serta mencegah periode leaderboard saling tumpang tindih. Hash ketiganya dicatat di Staging setelah audit, tetapi `0001/0002` pada `main` terbaru berisi migrasi lain. Jangan menyimpulkan bahwa migrator dapat melewati kedua versi dengan aman hanya dari hash yang tercatat. Jalur integrasi baru harus menghasilkan model Staging pada instalasi baru dan tidak mengulang DDL pada Staging yang sudah memilikinya. NestJS menggunakan koneksi PostgreSQL server-side sebagai jalur data domain. [Panduan RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

Aturan apakah guru boleh aktif di beberapa sekolah masih menunggu keputusan produk. Schema sekarang mengizinkan satu afiliasi aktif per pasangan guru–sekolah; Backend harus menegakkan kebijakan produk yang nantinya disetujui. Kecocokan tipe paket–attempt dan beberapa relasi item/pertandingan kini ditahan FK komposit. Aturan lintas tabel lain seperti role peserta, kepemilikan kelas, dan kelayakan konten terbit tetap perlu transaksi dan validasi Backend.

## 3. Seed cloud dan integrasi tim

Jangan jalankan `db:seed` pada Staging atau Production. Seed saat ini memakai UUID Auth placeholder dan hanya diizinkan pada sandbox development terpisah dengan `NODE_ENV=development` serta `ALLOW_DEMO_SEED=true`. Akun yang dapat login harus terlebih dahulu ada di Supabase Auth dan `users.auth_user_id` harus cocok dengan `auth.users.id`. Siapkan seed demo Staging terpisah sesudah akun dan kontrak data tiap fitur disepakati.

Frontend menerima `NEXT_PUBLIC_SUPABASE_URL` dan publishable key proyek demo untuk Auth. Backend dan worker menerima `DATABASE_URL` cloud dari penyimpanan rahasia deployment. Hanya satu operator/CI menerapkan migrasi; tim fitur mengajukan kebutuhan tabel, constraint, dan fixture lewat review. Frontend tidak memakai database password maupun secret/service-role key.

Setelah migrasi, kontrak seed dan API tiap tim tetap perlu disepakati dan diuji. Aturan OPEN pada PRD tidak boleh dikunci sebagai kebijakan final hanya karena seed demo memerlukan contoh data. Migrasi berikutnya harus menjaga RLS dan grant, serta tidak mengubah versi soal, paket, atau hasil historis yang sudah dipakai.
