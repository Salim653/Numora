# Reconciliation release chain - 3 October 2026

**ENGINEERING DECISION - instruksi Aini:** rekonsiliasi #41/#45 tetap dua PR fitur. #46 adalah fondasi connected chain dan fix offline. GitHub mewajibkan satu approval reviewer; merge langsung/auto-merge ditolak, sehingga kandidat gabungan diuji sebelum main berubah.

## Candidate and review order

Urutan merge tetap #46 -> #41 -> #45. #41 direkonsiliasi terhadap main; #45 sementara berbasis branch #41 agar review hanya history dan dua penambahan tes browser tidak berbenturan. Setelah #41 masuk main, ubah base #45 ke main, merge main terbaru, lalu ulangi CI sebelum merge #45. Jangan force-push atau ikut mendorong commit worker/Redis dari branch JOB-07 lokal.

Branch kandidat menggabungkan head ketiga PR dari remote/worktree bersih. Dedicated validation PR hanya menambahkan harness/test/bukti, berbasis branch kandidat baseline; bukan jalan bypass approval atau PR pengganti fitur. Setelah ketiga PR masuk main, retarget validation PR ke main agar diff tetap scope pengujian dan jalankan ulang satu SHA final.

## Required connected evidence

`pnpm test:release-chain` kini menjalankan empat kasus, tanpa skip dan tanpa mock API produk. Tiga rantai JOB-06 tetap berjalan, diikuti TryOut Mandiri/Sekolah -> save/resume -> repeated/concurrent start/submit -> join setelah start -> waiting/result release -> Student level history/Teacher class history -> database snapshot/pins/outbox.

Bukti `.tmp/job06-evidence/connected.json` harus mencatat satu checkout SHA yang bersih sebelum/sesudah seluruh run dan empat check selesai. CI menggunakan PostgreSQL 16 dan Redis 7; runner memakai DB khusus localhost `numora_test_job06` atau suffix yang diizinkan, bukan Supabase/Upstash shared. Perintah dan guard mengikuti [JOB06 release chain](JOB06_RELEASE_CHAIN.md).

Fixture TryOut hanya dua soal PG DEMO, durasi test 3600 detik, dan synthetic IRT release berlabel TEST_ONLY. Paket dibuat DRAFT lalu diaktifkan hanya oleh endpoint harness lokal yang dilindungi guard service terisolasi. Synthetic batch/item metadata hanya menguji gate release existing, bukan mengeksekusi model IRT, menyediakan 30 responden nyata, menetapkan rubrik/skala, atau mempublikasikan paket resmi. Tidak ada endpoint fixture yang terdaftar di API production.

## Acceptance boundaries

Google nyata, konten reviewed Curriculum, staging/trial dan QA independen tetap NOT RUN/PENDING. Bukti JOB-06 sebelumnya dipertahankan; engineering PASS baru hanya berlaku bagi SHA yang tertulis di artifact. Tidak menutup PGK/Past/IRT/XP/retention OPEN dan tidak menyatakan JOB-06 atau JOB-07 keseluruhan DONE.

**Fixture correction:** initial connected run rejected start with TRYOUT_CONTENT_NOT_READY because shared Drill demo versions are DRAFT. The guarded harness creates dedicated READY test versions with explicit TEST ONLY text; it never promotes or edits existing demo/historical versions. This is test setup, not Curriculum approval. Initial failed evidence is not counted PASS.

Dedicated test versions include synthetic review metadata owned by the harness Admin fixture to satisfy the unchanged database review constraint. This metadata is explicitly test-only and does not represent real Curriculum review.
