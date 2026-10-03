# Reconciliation release chain - 3 October 2026

**ENGINEERING DECISION - instruksi Aini, 3 Oktober 2026:** rekonsiliasi #41/#45 tetap dua PR fitur. #46 menyediakan connected chain dan fix offline; #47 menambah pengujian gabungan. Setelah penolakan merge biasa karena required review, pemilik secara eksplisit mengizinkan admin bypass untuk rangkaian ini. CI head terbaru tetap wajib lulus sebelum merge; bypass bukan bukti reviewer approval atau QA independen. Pengaturan branch protection tidak diubah.

## Merge and verification order

Urutan merge #46 -> #41 -> #45 -> #47. #46 dan #41 sudah masuk main. #45 telah diubah base ke main dan disinkronkan dengan hasil merge sebelumnya. Validation PR #47 kemudian retarget ke main dan disinkronkan sebelum CI dan merge. Tidak force-push atau ikut mendorong commit worker/Redis dari branch JOB-07 lokal.

Hasil CI kandidat dipertahankan sebagai bukti untuk SHA masing-masing. Setelah #47 masuk main, workflow push main harus menjalankan semua gate dan empat kasus connected tanpa skip pada satu SHA merge final. Status merged, SHA main, run CI dan artifact yang sesuai SHA dicatat pada [PR #47](https://github.com/ayiinee/Numora/pull/47), agar bukti tidak keliru menggunakan synthetic merge SHA PR atau mengklaim hasil run yang belum terjadi.

## Required connected evidence

`pnpm test:release-chain` kini menjalankan empat kasus, tanpa skip dan tanpa mock API produk. Tiga rantai JOB-06 tetap berjalan, diikuti TryOut Mandiri/Sekolah -> save/resume -> repeated/concurrent start/submit -> join setelah start -> waiting/result release -> Student level history/Teacher class history -> database snapshot/pins/outbox.

Bukti `.tmp/job06-evidence/connected.json` harus mencatat satu checkout SHA yang bersih sebelum/sesudah seluruh run dan empat check selesai. CI menggunakan PostgreSQL 16 dan Redis 7; runner memakai DB khusus localhost `numora_test_job06` atau suffix yang diizinkan, bukan Supabase/Upstash shared. Perintah dan guard mengikuti [JOB06 release chain](JOB06_RELEASE_CHAIN.md).

Fixture TryOut hanya dua soal PG DEMO, durasi test 3600 detik, dan synthetic IRT release berlabel TEST_ONLY. Paket dibuat DRAFT lalu diaktifkan hanya oleh endpoint harness lokal yang dilindungi guard service terisolasi. Synthetic batch/item metadata hanya menguji gate release existing, bukan mengeksekusi model IRT, menyediakan 30 responden nyata, menetapkan rubrik/skala, atau mempublikasikan paket resmi. Tidak ada endpoint fixture yang terdaftar di API production.

## Acceptance boundaries

Google nyata, konten reviewed Curriculum, staging/trial dan QA independen tetap NOT RUN/PENDING. Bukti JOB-06 sebelumnya dipertahankan; engineering PASS baru hanya berlaku bagi SHA yang tertulis di artifact. Tidak menutup PGK/Past/IRT/XP/retention OPEN dan tidak menyatakan JOB-06 atau JOB-07 keseluruhan DONE.

**Fixture correction:** initial connected run rejected start with TRYOUT_CONTENT_NOT_READY because shared Drill demo versions are DRAFT. The guarded harness creates dedicated READY test versions with explicit TEST ONLY text; it never promotes or edits existing demo/historical versions. This is test setup, not Curriculum approval. Initial failed evidence is not counted PASS.

Dedicated test versions include synthetic review metadata owned by the harness Admin fixture to satisfy the unchanged database review constraint. This metadata is explicitly test-only and does not represent real Curriculum review.

## Verified local candidate

**Engineering PASS:** production-build SHA `bd3fb4c7ad806612d0cdf0eff52c6aaac511c1b0` ran all four connected cases without skip (3 October 2026, 10:18 WIB). [Sanitized local evidence](evidence/RECONCILIATION_LOCAL_2026-10-03.json) records the SHA, checks and explicit acceptance limits. PostgreSQL 16 and Redis 6.0.16 were isolated locally; Redis 7 and the complete workspace/migration/browser/build/contract gates run in CI. Local PASS is not a claim that the separate PvP/BullMQ suite works on Redis 6.

PR #41 CI `37091048108` and stacked #45 CI `37091262143` passed on their reconciled heads. Combined candidate CI/artifact belongs to [#47](https://github.com/ayiinee/Numora/pull/47); use the actual checkout/synthetic merge SHA in its artifact, not the feature heads or local evidence SHA. Documentation commits after the local evidence do not change which SHA that local run validated. Final merge/deployment still requires a fresh run on its one SHA.
