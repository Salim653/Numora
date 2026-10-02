# Joblist MVP — rekonsiliasi pekerjaan lama dan urutan pelaksanaan

**Tanggal:** 2 Oktober 2026, WIB. **Status:** PROPOSED rincian backlog engineering berdasarkan pembagian yang sudah digunakan. Keputusan produk/akademik yang OPEN tetap memerlukan owner terkait.

## 1. Acuan dan cara menggunakan daftar

Dokumen ini mencocokkan **seluruh 16 pekerjaan** dari joblist yang ditempel pengguna dengan [audit MVP terbaru](MVP_PRD_REVIEW_2026-10-02.md), [ownership](OWNERSHIP.md), [Sprint 2](SPRINT_2_GOAL.md), dan [rekonsiliasi PRD Drill v1.2 / TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md). Nomor **LAMA-01–16** merujuk daftar pengguna; **JOB-01–22** merujuk antrean baru.

Baseline kode diperiksa pada `origin/main` commit `3199eebba87f003f80bfc929847166e7100978c1`. [PR #32](https://github.com/ayiinee/Numora/pull/32) sudah merged. Perbedaan `4c94aaa` → `3199eeb` hanya menambahkan laporan audit; tidak ada perubahan aplikasi sejak snapshot audit. Angka database dalam laporan sebelumnya adalah snapshot audit 2 Oktober, bukan pemeriksaan database ulang pada penyusunan joblist ini. Status teknis dicocokkan kembali dengan kode/kontrak; acceptance Google/staging belum dinyatakan lulus.

**SELESAI TEKNIS** menutup implementasi lama yang sudah ada, bukan otomatis sign-off produksi. **PARSIAL** menyisakan integrasi/acceptance. **BELUM SELESAI** membutuhkan implementasi. **BERUBAH** berarti requirement lama diganti PRD terbaru. Tidak ada area fitur dari daftar lama yang dibuang diam-diam.

Urutan JOB adalah prioritas nominal. Pekerjaan yang independen dapat paralel; dependency wajib didahulukan. QA ikut sejak awal. Pemilik frontend dan backend tetap menulis tes modulnya; Salim memimpin acceptance lintas peran. Satu pekerjaan backend besar aktif per owner, agar Aini tidak mengerjakan TryOut, IRT, XP, Pretest dan PvP bersamaan.

## 2. Rekonsiliasi lengkap 16 pekerjaan lama

### LAMA-01 — Admin → Teacher → Student

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Profil Admin sudah ada pada snapshot baru; jalur token/class/domain tersedia. Tidak lagi menganggap Admin selalu belum diprovision.
- **Pekerjaan tersisa:** Pastikan Admin pada environment tujuan; Google browser chain, cross-class denial, expiry/race/refresh/duplicate submit. JOB-02,06.

### LAMA-02 — Level 2 playable

- **Status:** BELUM SELESAI
- **Sudah tersedia atau berubah:** Engine sudah unlock pada ≥80; snapshot audit Level 2 masih nol paket terbit.
- **Pekerjaan tersisa:** Konten Level 2/varian reviewed, publikasi dan play sesudah unlock. JOB-03,04,06.

### LAMA-03 — Pipeline paket Drill Admin

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** API list/detail/create/update/publish/archive dan integrasi engine canonical sudah ada; legacy `drill_*` bukan jalur baru.
- **Pekerjaan tersisa:** UI minimum paket Drill dan acceptance Admin publish → Student play. JOB-04.

### LAMA-04 — Penilaian/history

- **Status:** SELESAI TEKNIS untuk API/UI dasar
- **Sudah tersedia atau berubah:** Endpoint `/students/me/assessment-results`, cursor pagination dan UI sudah ada. Tidak membangun endpoint tersebut dari nol lagi.
- **Pekerjaan tersisa:** Regression ownership/history, konteks per-level, field XP/star pending, hasil TryOut dan Pretest sesuai kontrak terbaru. JOB-12.

### LAMA-05 — Konten/release/proteksi

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Playwright runner/CI dan rate limit verifikasi/join sudah ada. Soal demo lama semua berkunci B; kualitas dan review tetap harus diperiksa.
- **Pekerjaan tersisa:** Curriculum review dan variasi kunci yang layak; Google staging, operasi, real-flow E2E. JOB-02,03,06,21.

### LAMA-06 — XP/outbox/analytics

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Drill sudah canonical; backfill/version preservation dan consumer outbox sudah diimplementasikan. Tidak mengulang migrasi/consumer.
- **Pekerjaan tersisa:** Ledger posting/policy, rekonsiliasi XP, producer events lengkap dan delivery/retry evidence. JOB-11,20.

### LAMA-07 — Pretest

- **Status:** BELUM SELESAI + BERUBAH
- **Sudah tersedia atau berubah:** Schema/constraint saja; mapping hasil sempurna maksimal tiga level bukan keputusan final terbaru.
- **Pekerjaan tersisa:** 20 soal/bab, lifetime completion, Skip semua subbab Level 1, tanpa XP; placement/Skip/afiliasi disepakati owner. JOB-01,13.

### LAMA-08 — TryOut

- **Status:** PARSIAL + BERUBAH
- **Sudah tersedia atau berubah:** API attempt/save/manual submit/result gate sudah ada. Class-only dan blanket lock paket lampau tidak sesuai PRD terbaru.
- **Pekerjaan tersisa:** Gratis semua Student,35 PG/MCMA/Category, listing/detail/rules/countdown/auto-submit/IRT release. JOB-07–10.

### LAMA-09 — IRT

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Snapshot pseudonim, ekstraksi/boundary input, output validation dan batch persistence tersedia.
- **Pekerjaan tersisa:** Model Data, input PGK/output Student, harian Admin, batch TryOut, failure/retry/SLA/release. JOB-10.

### LAMA-10 — Feedback/monitoring

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Progres Guru latest/best dan daftar/cari/sort siswa ada; feedback baru schema.
- **Pekerjaan tersisa:** API feedback ≤1.000 karakter, inbox/read-state, riwayat asesmen untuk Guru yang berhak. JOB-15.

### LAMA-11 — Video/report Student

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** API/UI rekomendasi dan report ownership/idempotency tersedia; referensi canonical sudah didukung.
- **Pekerjaan tersisa:** Video reviewed/YouTube, kategori wajib/konteks, empty/broken/error states dan events. JOB-14,20.

### LAMA-12 — PvP realtime

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Engine/gateway/time/score/durable/reconnect/transport tersedia; simulator lama dihapus. Policy runtime masih null.
- **Pekerjaan tersisa:** Tutup OPEN-07, sediakan paket, aktifkan policy version dan uji pertandingan nyata. JOB-16.

### LAMA-13 — Leaderboard

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Proyeksi hourly/archive, REST PvP top 20/self dan pemisahan sumber sudah ada.
- **Pekerjaan tersisa:** Ledger/hasil valid, class ranks API, policy dan acceptance reset/archive/forfeit. JOB-11,17.

### LAMA-14 — Admin pengguna/kelas

- **Status:** BELUM SELESAI untuk scope ini
- **Sudah tersedia atau berubah:** Operasi sekolah/token/content tersedia; tidak perlu dibuat ulang.
- **Pekerjaan tersisa:** Daftar/detail/audit pengguna/kelas; koreksi/ban hanya sesudah keputusan OPEN. JOB-18.

### LAMA-15 — Dashboard/share kelas

- **Status:** PARSIAL
- **Sudah tersedia atau berubah:** Dashboard API sudah memiliki kelas/sekolah, affiliation, latest/best, aktivitas, active Drill.
- **Pekerjaan tersisa:** Reward/feedback fields sesuai kontrak; class link/QR dan auth continuation. JOB-19.

### LAMA-16 — Docs/handoff visual

- **Status:** PARSIAL / berkelanjutan
- **Sudah tersedia atau berubah:** Rekonsiliasi PRD dan audit terbaru sudah merged. Dokumen lama adalah snapshot historis.
- **Pekerjaan tersisa:** Status per flow/evidence, final UI handoff bila tersedia, tidak mengubah rule produk. JOB-22.

### Bagian lama yang tidak dikerjakan ulang atau tidak diterapkan

1. **Provision Admin dari nol untuk sandbox yang sudah punya Admin:** tidak dijadikan tugas otomatis. Verifikasi akun/role pada staging tujuan tetap wajib; bila belum ada, operator provision identitas Auth nyata sesuai prosedur.
2. **Migrasi Drill legacy → canonical dari nol:** implementasi/rehearsal sudah ada. Yang tersisa adalah verifikasi jalur upgrade pada target, backup dan preservasi data; jangan menghapus tabel/jurnal lama.
3. **Membuat ulang history API, publisher Drill API, consumer outbox, runner E2E atau rate limiter:** kapabilitas tersebut tersedia. Tambahkan hanya gap/integrasi/regression yang terbukti.
4. **Pretest hasil sempurna pasti membuka maksimal tiga level:** diganti seluruh mapping yang menunggu Curriculum/Product. Angka lama tidak menjadi acceptance final.
5. **TryOut hanya Student Sekolah atau payment Mandiri:** diganti TryOut gratis seluruh Student pada MVP. Pretest affiliation tidak otomatis ikut berubah; masih perlu keputusan.
6. **Seluruh paket TryOut lampau terkunci ketika paket baru rilis:** diganti Past listing dengan status; paket pernah dikerjakan tidak bisa diulang, never-attempted mengikuti keputusan Product.
7. **Skor PG 0–100 sebagai hasil TryOut final:** bukan hasil final berbobot IRT/skala TKA yang diminta PRD terbaru. Model/skala/output harus diberikan owner terkait.
8. **Retensi Drill 90 hari dan threshold bintang lama sebagai aturan final:** tidak dipakai sebagai requirement final baru. Kebijakan latest OPEN; preserve hasil/policy historis dan versi baru secara prospektif.
9. **Minimum 30 sebagai gate universal rilis hasil TryOut Student:** perlu review PO/Data terhadap low-response dan SLA; baseline 30 untuk detail soal Admin tidak otomatis berlaku universal.
10. **Admin CRUD tidak relevan sama sekali:** tidak benar. Ia tetap pekerjaan operasional lintas fitur dari daftar lama, tetapi tidak masuk acceptance journey dua PRD siswa. Tidak menambah dashboard pengubah mastery/XP/limit/reset.

## 3. Detailed list dari paling urgent ke less urgent

**Prioritas A (JOB-01–06):** keputusan/dependency dan alur trial pertama. **Prioritas B (JOB-07–17):** perilaku inti MVP dan fitur pendukung. **Prioritas C (JOB-18–22):** operasi dan kelengkapan integrasi. Urutan C tidak berarti QA/release baru dimulai di akhir: operasi minimum trial ada pada JOB-02/06, sedangkan JOB-21 berlaku sebelum setiap release fitur terkait. Seluruh fitur MVP yang diwajibkan tetap memerlukan gate sendiri.

### JOB-01 — Kunci dependency dan keputusan yang menghambat implementasi

- **Owner:** Farel (koordinasi); PO/Curriculum/Data/Software/UIUX sesuai keputusan. **Asal:** LAMA-05–09,12,14,16.
- **Kerjakan:** decision sheet berisi ID OPEN, rule FINAL, pilihan yang membutuhkan keputusan, owner, tanggal target, fitur/test yang terdampak, dan link keputusan. Prioritaskan konten Level 1/2; Drill XP/stars/retensi/session; TryOut PGK/durasi/skala/batch/model/Past/XP; Pretest placement/Skip/afiliasi; PvP edges; Admin koreksi/ban.
- **Output:** keputusan owner yang dicatat di PRD/module spec/OPEN register, lalu kontrak/policy version yang dapat dipakai developer. Angka yang belum diputuskan tetap pending atau fixture DEMO.
- **Bukti selesai:** item yang menghalangi jalur aktif sudah memiliki keputusan atau tanggal/owner dan batas implementasi yang jelas. Farel tidak mengesahkan rumus statistik/akademik sendiri. Infrastructure/kontrak generik tetap dapat dikerjakan saat menunggu.

### JOB-02 — Siapkan environment trial dan identitas tiga peran

- **Owner:** Farel; aliwafa frontend auth; Aini backend regression; Avicenna Admin UI; operator Database/DevOps untuk provisioning. **Asal:** LAMA-01,05.
- **Kerjakan:** pastikan staging pengguna nyata terpisah dari Development; host/domain, Google provider/callback/CORS/API URL, Redis prefix, server secrets dan schema target sesuai. Verifikasi Admin, Guru A/B, Student Sekolah dan Mandiri pada environment uji; provision hanya yang diperlukan melalui prosedur operator. Siapkan health dan backup/restore minimum serta sekolah/izin trial dengan Product/Design.
- **Output:** environment/commit/owner/akun uji siap, tanpa mencatat kredensial dalam repo/chat. UI session expiry/logout/account switch dan error429/503 jelas.
- **Bukti selesai:** Google login/callback berhasil, internal role benar, Admin dapat mengakses operasi sekolah/token, teacher verification dan class join dapat diuji. Health saja atau email QA tidak menutup gate Google.

### JOB-03 — Siapkan konten reviewed dan paket Level 2 yang playable

- **Owner:** Ferdi koordinasi/content API; Curriculum validator; Avicenna publikasi UI; Aini engine reviewer; Salim acceptance. **Asal:** LAMA-02,05.
- **Kerjakan:** review 10 soal Level 1 yang akan digunakan; siapkan 10 soal Level 2 dan varian setara sesuai ketersediaan yang disepakati. Periksa kompetensi, difficulty, stem, A–D/LaTeX untuk prototype, kunci/pembahasan, variasi posisi jawaban benar dan label demo. Jangan menyimpulkan fixture semua B sebagai konten TKA yang tervalidasi.
- **Output:** konten/version/reviewer yang tercatat; paket terbit terikat level dan policy, variant pool/fallback jelas. Perubahan konten tidak menimpa versi yang sudah dipakai attempt.
- **Bukti selesai:** paket Level 2 benar-benar dapat dimulai setelah ≥80 pada Level 1; pertahankan histories dan uji retry varian. Publish memakai workflow konten/operator yang sesuai, bukan edit ad hoc database atau menonaktifkan readiness check.

### JOB-04 — Sambungkan UI Admin ke publisher Drill yang sudah tersedia

- **Owner:** Avicenna frontend; Ferdi backend support; Aini review historical integrity; Salim flow test. **Asal:** LAMA-03.
- **Kerjakan:** UI minimum list/detail/draft/edit/publish/archive; pilih level/variant/scoring policy dan 10 versi soal. Gunakan existing Drill package API serta generated types. Tampilkan incomplete/unreviewed/published immutable/error states.
- **Output:** Admin dapat menerbitkan paket yang dibaca engine canonical tanpa dual-write legacy. Tidak membuat ulang API publisher atau editor bank lengkap.
- **Bukti selesai:** Admin publish → Student start/save/submit → historical result tetap sama setelah versi baru/archive. Pastikan Student/Teacher tidak dapat mengakses operasi Admin.

### JOB-05 — Tutup gap Drill session/result terhadap PRD terbaru

- **Owner:** Ferdi frontend; Aini domain/policy; Avicenna history integration; Salim QA. **Asal:** LAMA-02,04,06,16; gap baru PRD.
- **Kerjakan:** Retry langsung dari hasil gagal/completed, detail/history level, warning refresh/exit saat risiko data hilang, failed-save/retry/session lost, count-up tanpa pause/deadline. Representasikan XP/star/retensi pending sesuai keputusan; jangan menjanjikan 90 hari/rentang bintang sebagai rule terbaru. Durasi reward dari server, bukan jam UI.
- **Output:** UI/result contract jujur tentang policy dan state yang tersedia, retry memakai attempt baru, history terpisah, best score monotonic dan unlock permanen.
- **Bukti selesai:** 7/10 vs 8/10, retry score lebih rendah tidak relock, submit ganda, save failure tidak Saved, unsaved refresh/exit warning. Score/policy yang sudah historis tidak dihitung ulang setelah approval policy baru.

### JOB-06 — Buktikan trial chain nyata dan otorisasi lintas peran

- **Owner:** Salim acceptance; Farel integrasi; aliwafa onboarding/monitoring; Avicenna Admin; Ferdi Drill; Aini backend. **Asal:** LAMA-01,02,05.
- **Kerjakan:** pada satu release SHA, Admin sekolah/token → Guru Google login/verifikasi/create class → Student Google login/join/save/resume/submit Drill → Guru latest/best/progres siswa sendiri. Uji token 72 jam/single-use/revoke/reissue/race, satu kelas, foreign Teacher/Student denial, refresh/re-auth/double-submit; sertakan Level 2 continuation sebagai gate kelanjutan belajar.
- **Output:** testcase/evidence per environment/role/commit, daftar defect, konten reviewed dan scope trial yang disetujui. Reuse Playwright; fixture CI bukan bukti seluruh rantai ini.
- **Bukti selesai:** login/authorization/persistence/scoring ≥80/progres tidak memiliki critical failure. Level 2 playable adalah tambahan kelanjutan belajar di atas minimum Sprint 2 unlock, bukan perubahan diam-diam atas scope trial minimum. Salim menilai gate trial dan gate MVP penuh secara terpisah.

### JOB-07 — Perbaiki TryOut backend: free access, 35 item dan kontrak tiga format

- **Owner:** Aini backend; Ferdi consumer frontend; Data/Curriculum rubric/content; Salim contract tests. **Asal:** LAMA-08.
- **Kerjakan:** hapus class prerequisite pada API/dashboard/availability; simpan class snapshot nullable untuk Mandiri. Bedakan paket unavailable dari user ineligible. Validator/package delivery wajib 35 PG/MCMA/Category, answer union yang tervalidasi, pinned item/policy, shared package per batch dan satu attempt/user/package. Sediakan listing/detail/current/Past sesuai approved package policy.
- **Output:** controller/DTO/domain/schema migration bila perlu, OpenAPI/generated types dan tests. Numeric duration/composition/rubric/scale tidak ditebak; final publikasi menggunakan konten approved dari Curriculum.
- **Bukti selesai:** Mandiri/Sekolah sama-sama eligible tanpa checkout; count salah/answer type salah ditolak; repeated/concurrent start menghasilkan satu attempt; direct access unauthorized ditolak; unavailable/expired tidak bisa start. Persetujuan PGK scoring tetap dependency JOB-01.

### JOB-08 — Lengkapi TryOut frontend sesuai alur terbaru

- **Owner:** Ferdi; Avicenna Penilaian/history; Salim browser QA. **Asal:** LAMA-08,04.
- **Kerjakan:** Ongoing/Past dengan never-attempted/submitted/waiting/released/expired, detail/tutorial/rules, 35 soal satu per layar, radio/MCMA/category controls, navigator, truthful saving, submission success dan processing. Remove class-lock wording. Past never-attempted CTA mengikuti server policy.
- **Output:** UI memakai kontrak JOB-07; metadata periode/deadline/batch end dan SLA dari server; label simulasi, loading/error/empty/session states lengkap.
- **Bukti selesai:** ketiga format bisa diubah/navigate sebelum final; tidak ada second attempt/checkout; pending/delay tidak menampilkan partial score/key; result/error retry tidak membuat hasil baru. Tidak membuat response types manual yang menduplikasi generated contract.

### JOB-09 — Countdown dan auto-finalization TryOut yang berjalan tanpa browser

- **Owner:** Aini service/worker; Ferdi countdown UI; Salim race/network QA. **Asal:** LAMA-08; PRD requirement tambahan.
- **Kerjakan:** deadline server setelah attempt valid dibuat, countdown tidak pause, auto-submit pada 0 tanpa confirmation, dan finalizer bersama manual submit. Row lock/constraint menjaga satu finalization; worker/scheduler memulihkan overdue attempt sesudah restart tanpa browser. Hubungan package close/attempt deadline mengikuti decision.
- **Output:** manual/auto/save semantics, scheduled recovery, idempotent result/outbox dan observability. Tidak menambahkan timeout pada Drill.
- **Bukti selesai:** browser ditutup/jaringan putus saat expiry tetap final; manual dan auto bersamaan menghasilkan satu submission; save sesudah deadline ditolak; raw saved answers dipertahankan; timer tidak di-reset oleh refresh/re-auth.

### JOB-10 — Jalankan IRT dan initial weighted result/release TryOut

- **Owner:** Aini orchestration/worker/release; Ferdi snapshot/output integration; Data model/calibration; Curriculum/PO scale/policy; Avicenna Admin state; Salim QA. **Asal:** LAMA-09,08.
- **Kerjakan:** perluas existing pseudonymous envelope untuk PGK dan output berbobot per siswa; pisahkan daily Admin item analysis dari TryOut batch closure/release. Bekukan raw responses/input/model/policy; persist initial weighted score pada approved TKA scale, release atomik, retry/failure/low-response dan overdue monitoring.
- **Output:** pipeline versioned end-to-end, resultReleasedAt/per-user result contract, approved batch end, processing/status dan Admin insufficient display. `sampleSize >=30` Admin tidak otomatis menjadi gate universal Student.
- **Bukti selesai:** score/key/explanation tersembunyi sampai release, hasil tersedia ≤3×24 jam dari batch end sesuai policy approved, released score immutable, failure/retry tidak merusak raw submission. Model Data tidak diganti skor PG ternormalisasi atau formula buatan engineer.

### JOB-11 — Posting XP durable dan idempotent

- **Owner:** Aini ledger/domain; Ferdi result UI; Data/PO formula; Salim consistency QA. **Asal:** LAMA-06,08,13.
- **Kerjakan:** setelah approval formula, implementasikan XP Drill (base/gagal/bonus eligibility <15 menit) dan TryOut (final-score-only, tanpa speed bonus). Pin policy, satu source per valid attempt/released result, atomic ledger/outbox menurut timing approved; tampilkan pending sebelum valid.
- **Output:** API XP result, event/ledger transactional, reconciliation tooling dan regression tests. Consumer outbox yang sudah ada dipakai ulang.
- **Bukti selesai:** duplicate submit/release/job tidak menggandakan XP; tepat 15 menit tidak eligible bonus Drill; TryOut duration tidak menambah XP; Pretest/PvP tidak masuk ledger XP kelas; perubahan formula tidak merombak XP historis.

### JOB-12 — Lengkapi Penilaian/history dan acceptance hasil tersimpan

- **Owner:** Avicenna frontend; Aini query/contract; Ferdi result coordination; Salim ownership/history tests. **Asal:** LAMA-04,15.
- **Kerjakan:** reuse history API/pagination; tampilkan latest/best dan seluruh attempt, konteks level/jenis aktivitas, pending XP/star, TryOut waiting/released serta Pretest result route hanya ketika API tersedia. Akses pembahasan mengikuti approved retention; preserved result tidak hilang karena explanation policy berubah.
- **Output:** per-level history/context dan UI loading/empty/page-error/access states; contract additions minimal bila diperlukan.
- **Bukti selesai:** Student hanya history sendiri, score 0 benar, lower-score retry tidak overwrite best/history; no premature TryOut score; cursor tidak menggandakan/melewatkan record pada testcase; content correction tidak mengubah hasil lama.

### JOB-13 — Implementasikan lifecycle Pretest dan Skip

- **Owner:** Aini backend; Avicenna frontend; Curriculum/PO placement/content/eligibility; Salim QA. **Asal:** LAMA-07.
- **Kerjakan:** eligibility chapter, modal Mulai/Skip, 20 soal, start/save/resume/submit/result, completed/skipped/mapping-unavailable, no XP, lifetime completion constraint. Skip membuka Level 1 semua subbab tanpa menurunkan existing progress. Rekonsiliasi afiliasi dan kesempatan sesudah Skip sebelum final behavior.
- **Output:** API/generated contract/schema changes bila diperlukan, bank 20 soal reviewed, history dan UI state. Mapping seluruhnya approved atau unavailable; tidak memakai otomatis batas tiga level dari joblist lama.
- **Bukti selesai:** no repeated completed Pretest, concurrent actions aman; 20 soal dan 0 XP; semua subbab terbuka Level 1 sesudah Skip; placement tidak menarik unlock/history lama. Tes numerical mapping menunggu Curriculum approval.

### JOB-14 — Lengkapi YouTube recommendations dan report contexts

- **Owner:** Ferdi backend/Student UI; Avicenna Admin review/resolve UI; Curriculum/Data video mapping; Salim QA. **Asal:** LAMA-11.
- **Kerjakan:** kurasi/mapping video, YouTube HTTPS validation, maksimal 3 saat failure subbab terkait, empty/broken/error nonblocking. Kategori soal/opsi/kunci/pembahasan, referensi question/version/variant/level/subbab/attempt dan video mapping tervalidasi; reuse report idempotency.
- **Output:** approved recommendation data, UI report validation/success/error, Admin destination yang dapat ditindaklanjuti. Tidak menambahkan Student report history/notifikasi follow-up yang di luar v0.5.
- **Bukti selesai:** score≥80 tidak mendapat recommendation; non-YouTube ditolak sesuai policy; wrong-owner report ditolak; retry requestID yang sama satu laporan; hasil Drill tetap terlihat ketika video kosong/gagal. Events ditangani JOB-20.

### JOB-15 — Feedback satu arah dan monitoring Guru lengkap

- **Owner:** Ferdi backend **sementara, PROPOSED pengganti kapasitas Andi**; aliwafa Guru/inbox UI bersama Ferdi; Farel integrasi; Salim QA; Aini backend reviewer. **Asal:** LAMA-10.
- **Kerjakan:** owned-class feedback create/list/read,1–1.000 karakter, Student inbox/readAt idempotent dan akses history asesmen Guru untuk siswa kelas miliknya. Complete loading/empty/error dan latest/best 0 states. Tidak membangun chat dua arah.
- **Output:** module/service/DTO/OpenAPI, ownership tests, Teacher send dan Student read UI. Scope backend tambahan ini antre setelah core-critical tasks Ferdi, bukan otomatis dibebankan ke frontend aliwafa.
- **Bukti selesai:** Guru tidak mengirim/membaca siswa kelas lain; Student tidak membaca feedback Student lain; mark-read tidak menggandakan state; batas karakter server-side. Tidak menyimpulkan Andi hadir dari tabel ownership historis.

### JOB-16 — Aktifkan PvP policy final dan pertandingan nyata

- **Owner:** Aini engine/gateway/policy; Ferdi PvP UI; PO/Software/QA edge decision; Curriculum paket; Salim multiplayer QA. **Asal:** LAMA-12.
- **Kerjakan:** reuse existing engine, pin production policy approved, menyediakan 10 soal urutan sama, authoritative waktu/skor serta batas waktu 30/45/60 detik dan reconnect 20 detik, room/share/classmate invite access, disconnect/readiness/expiry/cancellation sesuai keputusan. Aktivasi tidak memakai fixture policy produksi.
- **Output:** availability yang benar, durable match/result/outbox dan frontend recovery states. Mandiri dan Sekolah boleh match; invite teman kelas tetap memerlukan kelas.
- **Bukti selesai:** dua browser nyata tersinkron, client fake-score/time ditolak, answer lock dan transition benar, reconnect≤20detik kembali, forfeit tidak masuk best record, dua disconnect/restart sesuai policy. Tidak membangun ulang simulator lama.

### JOB-17 — Sajikan leaderboard kelas/PvP dari sumber valid

- **Owner:** Aini projection/API; Ferdi UI; PO/Data tie-policy; Salim period/access QA. **Asal:** LAMA-13.
- **Kerjakan:** reuse projection/archive; class endpoint menyajikan ranks ketika XP policy siap, PvP best per difficulty valid, top 20/self dan privacy minimum. Hourly update dan period Rabu 23:59 WIB archive sesuai semantics yang tercatat.
- **Output:** availability/stale/update timestamp, ranks/current/archive contract dan UI non-fixture. Data XP JOB-11 dan PvP JOB-16 menjadi dependency masing-masing papan.
- **Bukti selesai:** class hanya anggotanya, Drill+TryOut saja; PvP/Pretest/forfeit excluded dari kelas/best sesuai rule; reproject tidak menggandakan, ties sesuai policy approved, batas minggu Asia/Jakarta benar. Redis restart tidak menghapus truth.

### JOB-18 — Admin pengguna/kelas dan correction policy

- **Owner:** Ferdi backend operational; Avicenna frontend; Farel PO/Data coordination; Aini identity/class reviewer; Salim access QA. **Asal:** LAMA-14.
- **Kerjakan:** list/detail/filter/page minimal pengguna/kelas dan audit dengan data minimum. Finalkan scope correction/wrong-class/ban/School↔Mandiri lewat OPEN-08/13/15 sebelum mutation terkait; tidak mengasumsikan self-transfer.
- **Output:** authorized Admin read/use-case, approved transaction/idempotency/version-preserving correction bila policy siap; account restriction reason/effect sesuai keputusan.
- **Bukti selesai:** non-Admin ditolak; history/class-at-event tetap utuh; correction/ban transaction dites dengan scenario approved; tidak mengekspos unnecessary PII. Menunggu policy bukan alasan membuat efek ban sendiri.

### JOB-19 — Kelas link/QR dan kelengkapan dashboard persisted

- **Owner:** aliwafa share/join UI; Ferdi dashboard; Farel browser integration; Aini backend support; Avicenna history partner; Salim QA. **Asal:** LAMA-15.
- **Kerjakan:** teacher share class code/link/QR, preserve destination sesudah Google login/registration, confirm class join, invalid/expired/one-class errors. Tambahkan reward/feedback dashboard ketika kontrak tersedia; reuse class/school/affiliation/latest/best/activity/active Drill API yang sudah ada.
- **Output:** kelas memakai link/QR yang hanya membawa join reference, bukan token Guru/PII; dashboard real persisted data dan pending-state jujur.
- **Bukti selesai:** pengguna yang belum login join lewat link/QR sesudah login tanpa bypass satu kelas; code reusable beberapa Student; logout/account switch membuang cache identitas; update kelas/feedback/reward dari API, bukan angka frontend buatan.

### JOB-20 — Lengkapi producer analytics dan operasi outbox

- **Owner:** Ferdi support/view-click producers; Aini domain/worker; Data schema; aliwafa onboarding/monitoring producer UI; Salim delivery QA; Farel coordination. **Asal:** LAMA-06,11,16.
- **Kerjakan:** gap inventory registered/join/affiliation, drill_started/question_answered/submitted/completed/unlocked/retry/explanation/view-video/report, Pretest dan TryOut events terhadap latest approved schema. Reuse durable outbox/dedup consumer; define trigger dan retry semantics, correlation dan PII-minimum.
- **Output:** contracts/producers/worker metrics dan event tests. Star/reward events baru valid sesudah policy/output ada; business mutation/outbox dalam transaksi yang sama.
- **Bukti selesai:** refresh/repeated request/job retry tidak menggandakan final contribution; event context versi/attempt/time benar; consumer replay aman; queue failures/backlog dapat diketahui. Tidak menghitung consumer existing sebagai belum dibuat.

### JOB-21 — Acceptance dan operasi release untuk scope yang akan diaktifkan

- **Owner:** Salim gate/evidence; Farel koordinasi; seluruh feature owner fixes; operator Database/DevOps release. **Asal:** LAMA-05,16 dan seluruh fitur.
- **Kerjakan:** matriks 49 AC Core Learning dan baseline lintas fitur, negative authorization, mobile target/browser nyata/accessibility, expired session/network/retry, PostgreSQL/Redis integration, backup/restore/upgrade/recovery/health/alert dan beban sesuai target yang disepakati. IRT low-response/SLA dan finalizer backlog khusus ketika TryOut dirilis.
- **Output:** release candidate SHA/environment, CI results, testcase IDs/evidence, migration/restore runbook, accepted residual defects dan sign-off scoped. Planning targets 100/500/1.000 concurrent serta RPO/RTO tetap PROPOSED sampai owner mengunci; tidak disebut PRD final.
- **Bukti selesai:** critical failure nol untuk scope aktif, Curriculum/Product/Software/QA/operator sign-off relevan; fitur yang belum compliant tidak diklaim MVP penuh. JOB-06 menangani trial awal; JOB-21 tidak menunda QA sampai semua kode selesai.

### JOB-22 — Status docs dan handoff visual yang disetujui

- **Owner:** Farel status board; Ferdi docs coordination; Avicenna/aliwafa/Ferdi layar masing-masing; UIUX handoff; Salim evidence. **Asal:** LAMA-16.
- **Kerjakan:** update status backend/frontend/persistence/tests/OPEN per flow setelah merge/QA; preserve dated historical audit. Terapkan final tokens/assets/handoff bila disetujui, prioritaskan usability/a11y dibanding redesign kosmetik saat critical flow masih gagal.
- **Output:** PR/task/AC/evidence links, status done yang dapat diverifikasi, handoff changes terpisah dari product-rule changes.
- **Bukti selesai:** pembaca dapat menemukan current execution/evidence tanpa salah menganggap snapshot lama current; tidak menulis ulang hasil tes masa lalu atau mengubah scoring/authorization hanya karena visual baru.

## 4. Pembagian tugas mengikuti daftar sebelumnya

**ENGINEERING DECISION yang sudah tercatat:** Ferdi Student Core Learning/PvP/leaderboard frontend + content/report/video/IRT backend; Aini engine/worker/XP/PvP/leaderboard backend; Avicenna Admin/content/History/Pretest frontend; Salim acceptance/E2E/release.

**PROPOSED pelaksanaan untuk enam anggota yang tersedia:** aliwafa kembali menangani onboarding/monitoring frontend; Farel PM/integrasi dan backup implementasi frontend. Ferdi mengambil backend feedback/operasional yang belum memiliki kapasitas Andi secara sementara; Aini menjadi reviewer/fixer identity/class bila ada defect. Andi/Tangguh/Nafi tidak diberi tugas seolah tersedia. Model/Data/Curriculum/DevOps tetap dependency eksternal, bukan engineer tambahan yang diasumsikan hadir.

### Ferdi

- **Fokus pertama:** JOB-03 konten/support publisher, JOB-05 Drill, dukungan JOB-06
- **Antrean berikut sesuai dependency:** JOB-08/09 UI TryOut; JOB-10 IRT boundary; JOB-11 result; JOB-14 support; JOB-15 backend sementara; JOB-16/17 UI; JOB-18/19/20/22 bagian terkait
- **Batas tanggung jawab:** Jangan mengerjakan semua backend/UI paralel; statistik IRT dari Data.

### Aini

- **Fokus pertama:** JOB-02/06 backend regression seperlunya; JOB-07 kontrak/access, lalu JOB-09 finalizer
- **Antrean berikut sesuai dependency:** JOB-10 orchestration/release → JOB-11 XP → JOB-13 Pretest → JOB-16/17 PvP/ranks; review feedback/Admin; JOB-20 worker
- **Batas tanggung jawab:** Satu pekerjaan besar aktif; tidak mengarang rubrik/model/formula.

### Farel

- **Fokus pertama:** JOB-01 keputusan, JOB-02 staging/aktor/izin, JOB-06 browser integration
- **Antrean berikut sesuai dependency:** Koordinasi dependency/merge/evidence seluruh jobs; JOB-19 auth continuation support; JOB-21/22 release/status
- **Batas tanggung jawab:** PM mengatur owner keputusan, tidak unilateral menetapkan akademik; coding onboarding pendukung aliwafa.

### aliwafa

- **Fokus pertama:** JOB-02 onboarding/session/error dan JOB-06 teacher/student flow
- **Antrean berikut sesuai dependency:** JOB-19 link/QR, JOB-15 monitoring/feedback UI sesudah kontrak; JOB-20 onboarding events; JOB-21/22 a11y/handoff
- **Batas tanggung jawab:** Backend authorization/policy tetap Aini/Ferdi; tidak bentrok file Farel.

### Avicenna

- **Fokus pertama:** JOB-04 UI publisher; verification/history JOB-12 dapat mulai pada API existing
- **Antrean berikut sesuai dependency:** JOB-13 Pretest setelah backend; JOB-14 Admin support; JOB-10 Admin IRT states; JOB-18 operations; JOB-21/22 QA/handoff
- **Batas tanggung jawab:** API/history/publisher yang ada dipakai ulang; response types generated.

### Salim

- **Fokus pertama:** JOB-01 testability, JOB-03 konten/evidence, JOB-06 real-flow acceptance
- **Antrean berikut sesuai dependency:** Testcase/race/regression untuk JOB-07–20; JOB-21 release evidence; JOB-22 status
- **Batas tanggung jawab:** QA ikut awal; developer tetap menulis unit/integration, operator tetap menjalankan provisioning/release.

## 5. Pekerjaan yang dapat dimulai serentak sekarang

1. **Farel:** decision sheet dan owner/akses staging/Google; koordinasikan review konten.
2. **aliwafa:** onboarding/session/monitoring dasar pada existing API dan repro flow browser.
3. **Avicenna:** UI minimum publisher Drill; regression history existing.
4. **Ferdi:** Drill warning/result/retry serta handoff konten Level 2 dan support existing API.
5. **Aini:** TryOut access/availability dan rancangan kontrak/finalizer; backend trial defect menjadi interrupt prioritas bila ditemukan.
6. **Salim:** acceptance test matrix dan real-flow checklist; uji existing modules tanpa menunggu fitur berikutnya selesai.

Sesudah dependency kontrak siap, task berpindah antrean secara eksplisit. Target sekitar 12 Oktober tetap checkpoint gate: first trial dan MVP penuh dinilai terpisah; tidak menutup unfinished jobs hanya untuk menyesuaikan tanggal.

## 6. Referensi implementasi dan evidence

- [Review MVP + seluruh 49 AC](MVP_PRD_REVIEW_2026-10-02.md), [QA Guide](../testing/QA_GUIDE.md), [release checklist](../operations/RELEASE_CHECKLIST.md).
- [Canonical learning controller](../../apps/api/src/modules/learning/learning.controller.ts), [Drill service](../../apps/api/src/modules/learning/drill-assessment.service.ts), [history service](../../apps/api/src/modules/learning/assessment-history.service.ts).
- [Publisher Drill](../../apps/api/src/modules/content/drill-packages.service.ts), [Admin UI](../../apps/web/src/features/admin/content.tsx), [demo content seed](../../packages/database/src/demo-learning.ts).
- [TryOut service](../../apps/api/src/modules/learning/tryout.service.ts), [release gate](../../apps/api/src/modules/learning/tryout-release.service.ts), [IRT boundary](../../apps/api/src/modules/irt/irt-integration.service.ts).
- [Worker](../../apps/worker/src/main.ts), [outbox](../../apps/worker/src/outbox.ts), [PvP policy module](../../apps/api/src/modules/pvp/pvp.module.ts), [leaderboard service](../../apps/api/src/modules/leaderboards/leaderboards.service.ts).
- [Student support](../../apps/api/src/modules/reports/student-support.service.ts), [monitoring controller](../../apps/api/src/modules/monitoring/monitoring.controller.ts), [dashboard service](../../apps/api/src/modules/learning/student-dashboard.service.ts), [browser fixture suite](../../apps/web/e2e/student.spec.ts).
- [Latest PRD reconciliation](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md), [OPEN register](../product/OPEN_DECISIONS.md), [ownership](OWNERSHIP.md).

Pembaruan ini hanya dokumentasi backlog. Tidak menjalankan provisioning/seed/migrasi/submit terhadap shared database dan tidak mengubah kode aplikasi, environment, API/schema atau rule produk.
