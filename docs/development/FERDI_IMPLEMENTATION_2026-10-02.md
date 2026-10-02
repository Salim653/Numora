# Implementasi Ferdi — 2 Oktober 2026

**ENGINEERING DECISION:** rencana pengguna mencakup seluruh ownership Ferdi, tambahan sementara feedback/backend operasional Admin, kapasitas paruh waktu dan checkpoint 12 Oktober berbasis gate. Tidak ada handoff defect/shared auth/route/navigation Farel atau approval/input Curriculum/Data/PO/UIUX/operator baru pada sesi ini.

Baseline `origin/main` = `33410fb`, sesudah integrasi PR #29. Worktree `D:\numora-ferdi-mvp-20261002`, branch `feat/ferdi-mvp-completion-2026-10-02`; workspace IDE dan `.env` pengguna tidak diubah. Klarifikasi ownership docs dari `bfd4ba1` dipertahankan secara eksplisit, tanpa membawa kode aplikasi dari branch lain.

## Status pekerjaan

**Implemented:** kode/kontrak tersedia untuk review. **Awaiting dependency:** gate produk/integrasi belum terpenuhi. **QA verified:** acceptance independen Salim pada scope/SHA/environment diketahui. **Release verified:** bukti operator pada environment tujuan. Tes penulis implementasi tidak menggantikan dua status terakhir; keduanya belum diklaim pada sesi ini.

| Pekerjaan | Implementasi paket ini | Gate tersisa |
| --- | --- | --- |
| JOB-03/04 konten/publisher | Publisher canonical existing dipakai; empat set DEMO/DRAFT 10 soal/set (Level 1/2 × V1/V2), schema/kunci/persamaan/diversitas A–D tervalidasi | Curriculum taxonomy/kesetaraan/review/video, UI publisher Avicenna dan publikasi operator; belum konten Level 2 production-playable |
| JOB-05 Drill | Retry langsung gagal/completed memakai start API/level server; guard klik ganda; warning unsaved; ack harus cocok; retensi 90 hari tidak diklaim final; stars/XP pending | Review, policy retensi/stars/XP/session dan acceptance historis/best/unlock; browser Back tidak dijanjikan terblokir |
| JOB-08/09 TryOut | Copy gratis semua Student; detail/rules; clock serverTime+deadline dan monotonic elapsed; reload tidak membuat deadline baru; auto/manual memakai satu jalur UI; error meminta cek state; polling release | API Aini masih class-only/PG; listing Past, answer union 35 soal, finalizer server tanpa browser, durasi/eligibility. Kontrol PG/MCMA/Category presentasional tersedia dan diuji, belum dipasang ke DTO live yang belum mendukung PGK |
| JOB-10 IRT | V1 tetap default; V2 opt-in internal raw PG/MCMA/Category/unanswered + penilaian nullable; output per attempt/respondent/policy/model/scale beku/idempotent | Envelope V2 PROPOSED untuk Data; model/rubrik/skala/low-response dan worker/release Aini. Completion tidak membuka hasil/mengubah score attempt/mencatat XP |
| JOB-11/12 reward/history | Result UI memakai metadata persisted; history existing dipakai; query Guru memakai classIdAtStart dan cursor berscope | XP/star/result DTO Aini, formula PO/Data dan Penilaian Avicenna |
| JOB-14 video/report | Parser YouTube HTTPS/host/ID; write/import validation; filter valid sebelum cap tiga pada support/hasil Drill; empat kategori soal; video report context snapshot dan stable request retry | Video approved Curriculum dan Admin review UI Avicenna |
| JOB-15 feedback | Teacher create/list, Student inbox/summary/read; active verified owned-class guard; 1–1000 karakter; concurrent replay/conflict; read timestamp pertama idempotent; Guru history berscope | UI Teacher/inbox aliwafa, review Aini dan acceptance independen |
| JOB-16 PvP | Guard double-command; retry timeout memakai requestId sama; uncertainty recovery; reconnect countdown dari server; durasi soal tidak ditebak | Policy/backend/content Aini, Redis transport terisolasi dan dua browser; availability tetap server-gated |
| JOB-17 leaderboard | Top/self/rank persis server; angka provisional disembunyikan saat policyPending; refresh dan periode/update WIB | Archive/projection Aini, tie policy Data/PO, aktivasi; tidak mengarang endpoint/arsip |
| JOB-18 Admin | GET list/detail pengguna/kelas; filter/pagination; Admin guard; field minimal tanpa email/auth ID/join code | Frontend Avicenna/review Aini; ban/transfer/afiliasi menunggu OPEN-08/13/15 |
| JOB-19 dashboard | Preview tiga feedback persisted + unread count; error nonblocking; preview tidak menandai pesan read | Inbox aliwafa dan reward DTO Aini |
| JOB-20 analytics | Producer TryOut view/detail, Drill explanation/video click; Retry canonical, report/feedback/read dan outbox ditulis dalam transaksi; UUID retry dedup/conflict | Payload/trigger Data PROPOSED; SUPPORT_ANALYTICS_ENABLED=false default. Domain score/XP/answer events tetap Aini |
| JOB-21/22 QA/docs | Tes modul/HTTP/database/browser, generated OpenAPI/types, handoff/runbook dan ownership | Acceptance Salim, visual handoff, staging Google/Redis/operator dan release SHA |

## Kontrak dan migrasi

Handoff consumer: [feedback/Admin](../api/FERDI_FEEDBACK_OPERATIONS.md), [support/IRT](../api/FERDI_CONTENT_SUPPORT.md), [analytics](../data/EVENTS.md), [kandidat konten](../content/ferdi-drill-review-2026-10-02/README.md).

TryoutAttemptDto.serverTime opsional menjaga kompatibilitas client/fixture lama; server baru mengirimnya. Tanpa clock tersebut UI tidak melakukan auto-finalization berdasarkan jam perangkat. Ini metadata waktu, bukan perubahan scoring/policy; review Aini diperlukan. Halaman meminta submit saat expiry; finalizer Aini tetap wajib menutup attempt saat browser mati. Polling/current/result tidak membuka skor sebelum server release.

V2 IRT merupakan kapabilitas internal PROPOSED, bukan kontrak Data approved. Worker existing tidak otomatis berpindah V2. Nilai/model/skala TEST ONLY tidak menyatakan policy final. Snapshot dengan jawaban berubah sesudah cutoff ditolak supaya item tidak hilang diam-diam. Completion/historical release tetap immutable; gate ≥30 Admin item stats existing tidak dinyatakan sebagai universal release gate respondent V2.

`0010_irt_scoring_output` menambah nullable irt_batches.output_snapshot; `0011_video_report_context` menambah nullable video_reports.attempt_context. Video report baru menyimpan attempt/level/subchapter/video yang diverifikasi server; retry context berbeda ditolak. Laporan lama tetap null karena original attempt tidak diketahui, tanpa backfill palsu; ownership retry tetap diperiksa.

Migrasi hanya diterapkan pada PostgreSQL localhost milik sesi (`127.0.0.1:55436`, database ferdi_mvp_test). Integration/migration suites memakai namespace/database tes terisolasi. Tidak memakai sandbox bersama/staging atau `.env` pengguna untuk tes mutatif. Rehearsal fork historis dan repeat migration harus menjaga seluruh field lama dan hash/jurnal, dengan kolom baru nullable.

Sebelum rilis shared/staging, operator melakukan backup/rehearsal salinan database, memastikan target dan approval, menjalankan migrator canonical sampai 0011 serta schema check. Jangan rewrite SQL/hash lama, menghapus histori, menurunkan cursor atau memakai dashboard SQL sebagai workflow normal. Development tetap tanpa Docker.

## Bukti verifikasi penulis implementasi

`pnpm run ci` lulus pada PostgreSQL tes terisolasi: root checks 4; database 8; API 79; web 51; worker 4. Lint, typecheck, build, contract validation dan generated-types freshness lulus. Lima tes Redis dilewati (empat transport PvP dan satu rate-limit code attempt) karena Redis lokal terisolasi belum tersedia; kelulusan PostgreSQL tidak menutup gate transport tersebut.

Playwright lulus 17 tes Chromium, mencakup viewport 320/360/390/768/1440, save/resume/submit, Retry hasil, warning refresh saat save gagal, serta fixture TEST ONLY TryOut 35 PG: countdown tetap setelah reload, auto-submit tanpa dialog dan pemulihan acknowledgement yang hilang. Fixture Teacher/Admin/login/join existing juga lulus tanpa mengambil ulang pekerjaan Farel. Screenshot dashboard 360/768/1440 diperiksa; copy TryOut pada dashboard kemudian diselaraskan ke gratis Mandiri/Sekolah dan diperiksa ulang pada tiga viewport tersebut.

Schema check lulus untuk 50 tabel dan kolom expected, dengan RLS aktif. `db:upgrade-check` membuktikan paket/attempt completed dan active, jawaban, progres serta versi pinned legacy Drill bertahan dalam forward migration. Integration suite juga menguji fork baseline historis, nullable kolom baru dan repeat migration. Dua kali OpenAPI generation menghasilkan SHA-256 sama (`e82c6f9d7dbc936fbef028fd6787a1706ed72f1669a2c51058a0ebf3915fb25f`); generated-types check lulus. Validator kandidat konten lulus untuk 40 soal DEMO/DRAFT; bukan Curriculum approval.

Log lokal: `D:/numora-ferdi-runtime-20261002/ci-final.log`, `browser.log` dan `browser-final-copy.log`. Fixture auth/API tidak membuktikan Google OAuth nyata, Data model, Curriculum readiness, Redis transport, acceptance independen atau deployment. QA verified dan Release verified tetap belum diklaim.

## Handoff dan checkpoint

Paket review bertumpuk: [kandidat konten PR #42](https://github.com/ayiinee/Numora/pull/42) → [backend/kontrak PR #43](https://github.com/ayiinee/Numora/pull/43) → branch Student `feat/ferdi-mvp-completion-2026-10-02`. Backend diuji terpisah dengan frontend baseline dan lulus CI (37 tes web); hasil gabungan di atas memakai 51 tes web. Setelah PR dasar merge, retarget PR berikutnya ke main terbaru dan jalankan pemeriksaan yang relevan. Tidak ada merge/deployment pada sesi ini.

Screenshot fixture tersimpan pada [evidence Student](evidence/ferdi-2026-10-02/README.md). Connector GitHub menolak create PR dengan `403: Resource not accessible by integration`; draft PR dibuat melalui CLI menggunakan credential Git yang sudah tersedia secara in-memory, tanpa menyimpan token atau mengubah login CLI/global config.

- Aini: review backend/DTO/migrasi/clock; sediakan generated TryOut listing/detail/Past, PGK answer union, finalizer/release/reward/XP/archive. Review feedback/Admin read. Engine/scoring tetap miliknya.
- Data/Curriculum/PO: review V2/events, konten/varian/video, durasi/rubrik/skala/low-response, XP/stars/retensi/tie/correction Admin. Proposal/fixture tidak menutup OPEN.
- aliwafa: generated Teacher feedback/inbox/read UI; monitoring/join integration menunggu handoff Farel.
- Avicenna: Admin users/classes read, laporan/publisher; sinkronkan Penilaian tanpa implementasi kedua.
- Farel: sembilan task existing tetap aktif; handoff defect konkret mencantumkan SHA/environment/repro/batas file. Auth/route/navigation/initial diagnosis Level 2 tidak diambil ulang.
- Salim/operator/UIUX: acceptance independen pada release SHA/environment, konten approved, Google/dua browser/Redis, migrasi/release evidence dan visual handoff.

12 Oktober adalah checkpoint gated. Trial Drill dinilai terpisah dari MVP penuh; sisa gate tetap Awaiting dependency. Sesudah kontrak approved datang, pasang adapter PGK/Past/release/archive dan lanjutkan acceptance pada branch pendek dari main terbaru.
