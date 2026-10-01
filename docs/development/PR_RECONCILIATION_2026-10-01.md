# Rekonsiliasi PR dan gate main — 1 Oktober 2026

Baseline sebelum pekerjaan: main `8305a4e` (PR #17), skema cloud sandbox telah direkonsiliasi sebelumnya. Dokumen ini mencatat perubahan pada branch rekonsiliasi; status merge terakhir harus dilihat di GitHub, bukan disimpulkan dari isi dokumen.

## Disiplin perubahan

- **ENGINEERING DECISION:** main tetap menjadi basis kode dan jurnal migrasi. Tidak ada perubahan skema, migrasi tambahan, seed cloud, atau penulisan data cloud dalam pekerjaan ini.
- Semua modul lama main (Identity, Schools, Classes, Learning, Monitoring, Health) dipertahankan. Seluruh 23 path OpenAPI baseline tetap sama; 25 path ditambahkan. Tidak ada schema OpenAPI lama yang hilang.
- Perubahan lokal `apps/web/next-env.d.ts` milik sesi development tidak dimasukkan ke commit.
- Backup refs/commit sebelum perubahan: `D:\numora-pr-cleanup\repository-before-cleanup.bundle`. Head fork PR #10 terbaru juga disimpan dalam `refs/archive/pr10-current` dan `D:\numora-pr-cleanup\pr10-current.bundle`.
- Commit asli Admin/Content `5105056` dipertahankan sebagai ancestor branch rekonsiliasi, tetapi tree main dipilih sebagai basis sebelum port. Ini sengaja menghindari penggantian modul berjalan dan penerapan skema/jurnal lama. Rekonstruksi kode asli tetap tersedia dari commit tersebut.

## PR dan bagian yang dipertahankan

| PR | Rekonsiliasi |
| --- | --- |
| #15 sesi Auth | Patch identik sudah masuk via `b234e88` dan PR #17. PR asal ditutup dengan bukti `git cherry`; branch tidak dihapus. |
| #16 akses demo | Head disinkronkan ke main, tes web 16/16 dan quality head `09bfa0c` lulus. Merge dengan `--admin` ditolak oleh aturan approval `main-2`; head ini disertakan dalam branch rekonsiliasi sehingga tautan demo dapat diintegrasikan bersama PR #11. |
| #10 skema v0.5 | Skema/jurnal main menggantikan alternatif lama. Guard seed identitas localhost dan penolakan migrasi pada database bertabel tanpa history dipertahankan. Main sudah memiliki pemeriksaan TLS/project/kolom/RLS dan bridge legacy Drill. Tidak mengimpor ulang migration journal fork. Tutup sebagai superseded setelah port guard terintegrasi. |
| #11 Admin/Content | Basis main + port selektif: taxonomy, soal/varian/versi immutable, metadata video, draf Tryout, dashboard, audit, tindak lanjut laporan, pembacaan batch IRT, dan UI Admin dengan Bearer. Branch asal diperbarui secara fast-forward setelah verifikasi, bukan force push. |

Branch `fix/data-pr10-integration` dari PR #12 yang sudah closed adalah jalur migrasi **retired**. Branch `fix/auth-session-state` dan branch schema lama juga bukan basis development. Histori/branch tidak dihapus; keberadaan branch tersebut tidak berarti main memerlukan merge jurnal alternatif. Pekerjaan baru harus dimulai dari main terbaru atau membawa main ke branch tugas yang masih aktif.

## Pemetaan port PR #11

| Sumber lama | Hasil aman |
| --- | --- |
| AppModule mengganti Identity/Class/Learning/Monitoring | Tambah Content/Admin/Reports/IRT tanpa menghapus modul baseline. |
| Controller admin tanpa auth; actor audit demo | Guard memanggil Identity, memeriksa ADMIN/ACTIVE, mengisi actor internal terverifikasi. Tidak menerima actor/reporter dari body administratif. |
| Audit ditulis terpisah | Mutasi dan audit berada dalam transaksi yang sama; kegagalan audit menggagalkan mutasi. Daftar audit umum tidak membuka metadata token lama. |
| Soal/edit/clone/publish pada bentuk DB lama | Keluarga → varian → versi dalam schema v0.5. Revisi membuat versi DRAFT baru, nomor versi dialokasikan di bawah row lock varian, versi lama tidak ditimpa. READY memerlukan materi induk dan keluarga READY serta tinjauan Admin tercatat. ARCHIVED tidak dapat diubah kembali menjadi DRAFT/READY; buat revisi baru. |
| Parent/nomor level dapat berubah | API update membatasi perubahan parent dan nomor level agar progres historis tidak berpindah arti. Nama/deskripsi/status tetap dapat dikelola. |
| Batas simpan video tiga per subbab | Metadata/pemetaan video pada schema v0.5; tidak membatasi jumlah penyimpanan menjadi tiga. Arsip mempertahankan mapping/report. Perpindahan subbab memerlukan mapping baru. |
| Paket Tryout lama dengan JSON daftar versi | Draf versioned assessment package dengan package_items yang menunjuk versi soal tetap. Paket yang bukan DRAFT tidak dapat diedit. Bobot item draf sementara sama dengan 1; tidak menjadi konfigurasi scoring resmi dan tidak dapat diterbitkan oleh UI ini. |
| Publikasi Tryout dengan jumlah/durasi/kebijakan lama | **OPEN-05/11/12/18:** publikasi ditolak `409 TRYOUT_POLICY_OPEN`. Tidak menyediakan editor parameter produk atau mengarang konfigurasi resmi. |
| IRT aggregate manual + actor demo | Membaca `irt_batches`/`irt_item_results`; parameter hanya terbuka untuk batch SUCCEEDED dan sample size ≥30. Tidak mengimplementasikan model/batch resmi atau upsert statistik manual. |
| Reports generik dengan reporter/refId dari body | Admin membaca question_reports/video_reports dan menyimpan status/tindak lanjut dengan audit. Route pembuatan laporan Student lama tidak diport: ownership dan referensi actual attempt harus dibangun di modul asesmen/video yang sesuai. Drill saat ini masih memakai tabel legacy; jangan memalsukan FK attempt_answers. |
| Admin page menggantikan root dengan API tanpa token | `/admin` tetap mengarah ke sekolah/token. `/admin/content` menjadi halaman tambahan yang memakai sesi Auth dan klien API bersama. UI memiliki loading/error/retry/empty/access-denied/success, pagination, form label, dan navigasi keyboard. API/UI response/request types dihasilkan dari OpenAPI. |

Editor soal pertama mempertahankan pilihan prototipe PG dengan empat opsi A–D, teks/LaTeX inline. Itu bukan aturan bahwa seluruh konten final harus memiliki tepat empat opsi. **OPEN-04:** PGK tetap di schema, tetapi publikasi/edit scoring finalnya tidak ditebak.

## Verifikasi

- 53 tes: root 3, database 2, API 27, web 21; termasuk tes lama Identity/Class/Teacher/Drill dan 11 tes tambahan Admin.
- HTTP nyata + PostgreSQL lokal: tanpa/invalid Bearer, role Student/Teacher/disabled, body/UUID/pagination tidak valid, actor palsu, duplikat, rollback audit, publikasi belum READY, versi lama immutable, revisi concurrent, varian lintas keluarga, versi paket pinned, penolakan published edits/OPEN publication, empat video, laporan/arsip/audit, IRT 29 vs 30 dan unfinished batch.
- UI menggunakan fixture fiktif di tes: akses Student ditolak tanpa fetch, network retry, submit PG dengan token, ID paket di luar halaman tetap dipertahankan, logout/API 403 menghapus tampilan data Admin.
- Kontrak JSON Schema compile/validate dan generated type check lulus. Lint/typecheck lulus. Upgrade legacy Drill dan bridge schema Staging diuji pada PostgreSQL lokal.
- `env:check`/`db:check` cloud lulus dengan operasi baca. Uji negatif seed pada hostname remote fiktif ditolak sebelum koneksi/penulisan; identitas demo cloud tidak dibuat.
- Build dan OpenAPI freshness pada CI GitHub head terbaru tetap harus lulus sebelum merge. Build Next tidak dijalankan di atas output server development pengguna yang aktif.

Test provider Auth pada tes HTTP diganti fixture untuk menguji application boundary. Ini **bukan** bukti login Google/callback. Akun sandbox Google Admin/Guru/Siswa belum tersedia menurut koordinator; acceptance browser tiga peran dan Curriculum review konten tetap menjadi dependensi sebelum uji pengguna/release.

## Quality required check: pemilik repository masih diperlukan

Tiga ruleset main aktif teramati: `24155025 main`, `24294660 main-1`, `24294661 main-2`. Daftar required status checks masih kosong saat pemeriksaan. `main` dapat dibypass oleh akun aktif; `main-2` tidak dapat dibypass dan mewajibkan satu approval write reviewer.

Permintaan PUT minimal pada ruleset `24294661` untuk menambahkan context `quality` dari GitHub Actions app `15368` ditolak **HTTP 404**. Akun aktif memiliki `push`, bukan `admin`; bypass merge tidak memberikan izin mengedit settings. Tidak ada rule/bypass actor yang dihapus atau dilemahkan.

**PROPOSED — memerlukan repository Administration write:** pemilik membuka Settings → Rules → Rulesets → main-2, mengaktifkan required status check `quality` dari GitHub Actions, lalu memverifikasi pada PR. Payload yang mempertahankan rule lain tersedia di `D:\numora-pr-cleanup\require-quality.json`; ambil ulang ruleset bila konfigurasi berubah sebelum dipakai. Backup ketiga ruleset tersedia di direktori yang sama. Rekomendasi berikutnya adalah menyederhanakan ruleset yang tumpang tindih setelah pemilik meninjau semantik bypass; perubahan itu tidak dilakukan dalam scope ini.

## Batas readiness

Rekonsiliasi PR tidak menyatakan seluruh PRD siap release. Pretest, Tryout resmi, PvP realtime, XP/leaderboard, feedback, pembuatan laporan Student/rekomendasi video, dan job IRT masih memerlukan implementasi atau acceptance masing-masing. Tim boleh melanjutkan dari basis main yang sama setelah PR ini terintegrasi, memakai sandbox, memperbarui konfigurasi/dependencies, dan memenuhi DoD fitur. Tidak ada jaminan bahwa pekerjaan masa depan bebas masalah.
