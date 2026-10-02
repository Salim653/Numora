# Integrasi Core Learning, Content, Student Support dan IRT

**PROPOSED — hasil integrasi 2 Oktober 2026, menunggu review maintainer.** Atas pilihan koordinator, PR #25, #22, #23 dan #24 digabung berurutan pada satu branch `integrate/core-learning-content-irt` untuk PR baru menuju main. Empat head asli tetap menjadi ancestor; main dan PR lainnya belum diubah oleh integrasi lokal. Ini tidak menyatakan kesiapan rilis sekolah.

## Perilaku gabungan

- Engine canonical, dashboard Student, Tryout/history, PvP dan leaderboard berasal dari #25.
- Admin menerbitkan paket Drill lewat #22; paket tersebut dapat dimainkan engine canonical tanpa dual-write ke `drill_*`.
- #23 menyediakan lanjut level, video/reports dan retry laporan idempotent. `questionInstanceId` canonical merujuk item attempt yang benar.
- #24 membekukan input pseudonim, memvalidasi output dan menyimpan batch IRT atomik. Sukses IRT tidak otomatis mengisi `resultReleasedAt` atau menghitung ulang nilai/XP historis.
- Konflik katalog mempertahankan dashboard berbasis NestJS #25 dan fitur support #23. Kontrak OpenAPI/types diregenerasikan dari aplikasi gabungan.

Publisher sebelumnya menerima policy dengan `configuration.assessmentType = DRILL` sementara engine hanya mengenali `DRILL_PG_DEMO` versi 1. Publisher kini memeriksa policy dan decoder konten yang dapat dimainkan engine. Batas prototype A–D adalah kompatibilitas implementasi sementara; bukan penutupan keputusan Curriculum atau perluasan penskoran PGK.

**PRD RULE:** sepuluh soal Drill, mastery 80%, timer count-up tanpa timeout produk, histori versi tetap, dan batas akses pembahasan 90 hari dipertahankan. **OPEN:** Pretest placement, paket Tryout resmi, PvP edges, XP final, model/statistik dan kebijakan rilis IRT tetap belum diselesaikan.

## Jalur migrasi

Jurnal aktif mempertahankan SQL/hash/timestamp 0000–0008 dari #25 dan menambahkan `0009_irt_integration_metadata`. Snapshot 0009 dibuat dari schema gabungan. Kolom IRT ditambahkan dengan `IF NOT EXISTS` agar metadata fork yang sudah ada tetap utuh.

SQL asli IRT `0004_flimsy_korg` dan `0005_irt_metadata_cursor_recovery` disimpan byte-for-byte di `packages/database/staging/fixtures/irt-branch`, bersama jurnal historisnya. File ini untuk pengenalan histori dan rehearsal; jangan menjalankan jurnal arsip sebagai jalur deployment baru. `.gitattributes` mempertahankan LF pada SQL aktif dan arsip agar hash konsisten lintas OS.

CLI `db:migrate`:

1. Checkout/database baru menerapkan seluruh jurnal aktif.
2. Database yang sudah memakai 0000–0008 menerapkan 0009 saja.
3. Database dengan hash IRT fork dan baseline 0003 yang dikenal dapat memulihkan migrasi Core Learning yang dilewati cursor. DDL/backfill dan insert histori pemulihan berada dalam satu transaksi; histori lama tidak dihapus/diubah.
4. Cursor tak dikenal yang akan melewati migrasi aktif ditolak. Schema yang menyimpang saat pemulihan menggagalkan transaksi. Operator perlu memeriksa backup/salinan dan menyelesaikan rekonsiliasi, bukan menghapus history untuk memaksa migrasi.

Sebelum shared/staging deployment, operator Database harus memeriksa histori aktual, backup dan melakukan rehearsal pada salinan. Pekerjaan ini hanya memutasi database uji lokal; tidak menerapkan migrasi atau seed ke Supabase shared development/staging.

## Validasi dan batas

Bukti pemeriksaan final dicatat setelah suite gabungan selesai. Tes tambahan memeriksa kedua histori IRT, pengulangan migrasi, penolakan cursor asing dan rollback schema yang menyimpang, serta alur Admin publish → Student start/save/submit → laporan soal → snapshot input IRT.

CI menyediakan PostgreSQL dan Redis untuk suite transport PvP. Browser fixtures tetap bukan bukti login Google nyata. OAuth dan acceptance Admin/Guru/Siswa pada staging, review Data terhadap envelope IRT, Curriculum terhadap konten, dan QA deployment/rollback tetap menjadi gerbang rilis.
