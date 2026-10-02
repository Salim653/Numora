# Review progress MVP dan pembagian tugas — 2 Oktober 2026

## 1. Kesimpulan audit

Fondasi Numora sudah terintegrasi dan memiliki bukti CI yang baik. Alur Drill, identity/sekolah/kelas, monitoring dasar, Admin konten, riwayat Student, laporan, outbox, dan fondasi IRT/PvP/leaderboard telah tersedia. Namun **MVP penuh belum selesai dan kesiapan uji sekolah belum terbukti**. Perubahan PRD terbaru telah masuk dokumentasi, tetapi belum diterapkan ke perilaku aplikasi.

Hambatan utama: Level 2 tidak memiliki paket terbit di database Development; TryOut masih mensyaratkan kelas, belum menegakkan 35 soal/tiga format/countdown/auto-submit, dan memakai skor PG ternormalisasi alih-alih hasil awal berbobot IRT; Pretest belum memiliki journey; XP belum ditulis; feedback belum memiliki API/UI; PvP sengaja dinonaktifkan; Curriculum, Google OAuth lintas peran dan operasi staging belum memiliki bukti acceptance lengkap.

Ini adalah review engineering dan **PROPOSED backlog**, bukan persetujuan rilis, perubahan aturan produk, atau penetapan keputusan OPEN. Pengguna mengonfirmasi pembagian lama tetap berlaku dan anggota yang tersedia hanya Ferdi, Aini, Farel, aliwafa, Avicenna, dan Salim.

**Rincian pelaksanaan terbaru:** [Joblist rekonsiliasi 16 pekerjaan lama dan 22 pekerjaan berurutan](MVP_JOBLIST_2026-10-02.md) mencatat bagian yang sudah selesai teknis, sisa pekerjaan, requirement terbaru, dependency dan bukti selesai per owner. **Klarifikasi pengguna 2 Oktober:** sembilan task profil/auth/role/afiliasi/join/monitoring/visibility/diagnosis Level 2/regression pada gambar sedang dikerjakan Farel; ia menjadi DRI tunggal task aktif tersebut. Gunakan joblist dan [OWNERSHIP](OWNERSHIP.md) untuk antrean/handoff saat ini. Bagian 8–9 laporan ini mempertahankan usulan awal dan tidak lagi menjadi acuan aktif pada penugasan yang bertumpang tindih. Snapshot audit, hasil tes dan angka database di bawah tetap historis pada waktu pemeriksaannya.

## 2. Sumber, baseline, dan batas pemeriksaan

Urutan acuan:

1. [PRD Drill v1.2](../product/sources/PRD_01_Drill_Latihan_Soal.docx.md) dan [TryOut v1.1](../product/sources/PRD_02_Core_Learning_TryOut.docx.md), diberikan 2 Oktober, untuk fitur terkait.
2. [Product Context](../product/PRODUCT_CONTEXT.md), [rekonsiliasi terbaru](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md), [OPEN register](../product/OPEN_DECISIONS.md), dan [PRD Mapping](../product/PRD_MAPPING.md). PRD v0.5 tetap baseline lintas fitur yang tidak diganti.
3. [Sprint 2 / scope trial pertama](SPRINT_2_GOAL.md), [ownership lama](OWNERSHIP.md), [batas modul](../architecture/MODULE_BOUNDARIES.md), kontrak/API, schema/migrasi, ADR, kode, dan tes.

Snapshot checkout: `main`, commit `4c94aaa3b1daf7a33e45f3b24c2971afd22633fa`. Working tree bersih sebelum laporan ini dibuat. `git ls-remote origin refs/heads/main` mengembalikan SHA yang sama. Review tidak menghitung branch lain sebagai fitur yang sudah masuk baseline.

Verifikasi GitHub langsung:

- [PR #29](https://github.com/ayiinee/Numora/pull/29), integrasi Core Learning/content/IRT/onboarding/UI, merged 2 Oktober pukul 11.35 WIB. Head `179b409`.
- [PR #31](https://github.com/ayiinee/Numora/pull/31), penyelarasan konteks PRD, merged 2 Oktober pukul 17.22 WIB. Head `0b1a5e4`. PR ini hanya mengubah dokumentasi/generator dokumen; tidak memperbaiki perilaku aplikasi.
- [CI PR #29](https://github.com/ayiinee/Numora/actions/runs/36963952218) dan [CI PR #31](https://github.com/ayiinee/Numora/actions/runs/36994547635) berstatus success; langkah test, browser, build, dan OpenAPI freshness lulus.

Log CI PR #31 menunjukkan 136 kasus: 4 root checks, 8 database, 70 API, 37 web, 4 worker, 13 Chromium. Ini bukti untuk head PR terkait. Status push-CI merge commit `main` tidak ditetapkan dari respons commit-status yang kosong; kosong bukan bukti gagal atau lulus.

Pemeriksaan yang dijalankan ulang pada audit ini:

| Pemeriksaan                                              | Hasil                                                 | Batas makna                                                                              |
| -------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Node / pnpm                                              | `v24.19.0` / `12.6.0`                                 | Sesuai engines repo.                                                                     |
| `pnpm env:check`                                         | Lulus                                                 | Konsistensi configuration; bukan bukti OAuth berfungsi. Tidak mencetak isi `.env`.       |
| `pnpm db:check`                                          | Lulus; 50 tabel yang diharapkan beserta kolom dan RLS | Pemeriksaan kompatibilitas schema, bukan full integrity/content acceptance.              |
| `pnpm test:checks`                                       | 4 lulus                                               | Guard development dan kontrak.                                                           |
| `pnpm contracts:validate`                                | 4 JSON Schema valid                                   | Kontrak yang ada valid secara struktur; belum memenuhi PGK/runtime terbaru.              |
| `pnpm contracts:types:check`                             | Lulus                                                 | Generated types konsisten dengan kontrak yang ada.                                       |
| Web `/`, API `/api/v1/health`, `/api/v1/health/database` | HTTP 200                                              | Layanan yang sudah berjalan merespons; revision proses tidak dipin oleh health endpoint. |
| API `/identity/me`, `/admin/irt` tanpa Bearer            | HTTP 401                                              | Penolakan anonymous; bukan bukti seluruh otorisasi resource.                             |

Lint/typecheck/build/suite penuh menggunakan bukti CI yang dibaca langsung; tidak diklaim telah dijalankan ulang lokal dalam audit ini. Browser suite mengintersep API dan Auth dengan fixture; tidak membuktikan Google login atau rangkaian browser ke database nyata. Audit membaca database dalam transaksi `READ ONLY`, tanpa seed, migrasi, provisioning, submit, atau perubahan data. Proses development yang sudah berjalan tidak dihentikan.

Dokumen [QA Seed](../testing/QA_SEED.md) mencatat smoke API development dengan akun email QA dan tes 7/10 versus 8/10 sebelumnya. Bukti historis tersebut tidak dijalankan ulang di sini dan tidak menggantikan Google OAuth.

## 3. Dua scope yang harus dinilai terpisah

**ENGINEERING DECISION yang sudah tercatat — trial pertama sekitar 12 Oktober:** Admin sekolah/token → Guru Google login/verifikasi/buat kelas → Siswa sekolah Google login/join/Drill → Guru melihat progres kelas sendiri. Konten demo harus ditinjau Curriculum. Pretest, TryOut, Mandiri, PvP, leaderboard dan feedback bukan scope sesi pertama.

**Scope MVP lebih luas:** seluruh kemampuan pada PRD lintas fitur, ditambah requirement Drill/TryOut terbaru. Trial Drill yang berhasil tidak berarti MVP penuh selesai. Admin CRUD konten yang sudah ada adalah kapabilitas operasional terpisah; kedua PRD fitur siswa mengecualikannya dari journey acceptance. Jangan memperluas UI konfigurasi parameter hanya karena API Admin sudah tersedia.

Target 12 Oktober adalah gerbang kesiapan, bukan jaminan seluruh MVP dapat selesai. Dengan enam anggota yang tersedia dan kebijakan akademik/Data masih OPEN, kelayakan MVP penuh bergantung pada penutupan keputusan, konten, kapasitas aktual dan bukti QA. Scope hanya dapat dikurangi melalui keputusan produk yang dicatat.

## 4. Snapshot database Development — terverifikasi baca saja

Target Auth cocok dengan Development sandbox yang dicatat dalam QA Seed. Nama historis `Numora-Staging` tidak menjadikannya staging pengguna sekolah. Snapshot ini bukan audit staging/produksi dan tidak menampilkan email, UUID pengguna, token atau kredensial.

| Objek                                      | Keadaan saat audit                                                            | Implikasi                                                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Profil aplikasi                            | 2 Admin, 6 Teacher, 12 Student                                                | Profil sudah ada; jumlah tidak membuktikan provider Google, validitas akun atau readiness trial.                                        |
| Level                                      | 2 READY                                                                       | Status level tidak berarti paket siap dimainkan.                                                                                        |
| Paket Drill Level 1                        | 2 PUBLISHED, 20 item total                                                    | Dua varian demo tersedia.                                                                                                               |
| Paket Drill Level 2                        | 0 PUBLISHED, 0 item                                                           | Unlock dapat berhasil, tetapi start level berikutnya akan menemui paket tidak tersedia.                                                 |
| Versi soal                                 | 20 SINGLE_CHOICE, seluruhnya DRAFT; 0 dengan reviewer/tanggal review tercatat | Engine memperbolehkan demo DRAFT berlabel; bukan bypass untuk konten final. Review Curriculum belum dapat dibuktikan dari metadata ini. |
| Attempt canonical                          | 8 DRILL GRADED, 1 DRILL IN_PROGRESS                                           | Ada hasil durable; audit tidak mengubah attempt.                                                                                        |
| Paket Pretest / TryOut / PvP               | Tidak ada pada agregasi paket                                                 | Jalur tersebut belum disuplai konten di sandbox ini.                                                                                    |
| Video / feedback / IRT batches / XP ledger | Masing-masing 0                                                               | Fondasi tabel/API tidak sama dengan pipeline terisi dan berjalan.                                                                       |
| Jurnal migrasi                             | 19 entri                                                                      | Dapat mencakup histori/recovery; jumlah bukan indikator error. Schema check lulus. Jangan reset jurnal.                                 |

Paket demo dapat dimainkan dengan versi DRAFT karena kondisi eksplisit `isDemo` pada engine. Publisher normal justru menolak versi yang belum READY/reviewed. Jalan penyelesaian Level 2 adalah penyiapan serta review konten dan publikasi melalui jalur yang sesuai, bukan menghilangkan readiness check atau menganggap seed demo sebagai persetujuan akademik.

## 5. Progress per area MVP

Status di bawah menunjukkan kedalaman implementasi, bukan persentase selesai atau sign-off release.

| Area                 | Yang sudah ada                                                                                                             | Sisa / kesesuaian PRD                                                                                                   | Penilaian                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Identity / Google    | Supabase Auth di web, verifikasi token API, registrasi Google-only Student/Teacher, role/status durable                    | Google callback, sesi, logout/re-auth dan tiga peran pada staging nyata perlu bukti                                     | Terintegrasi; acceptance runtime belum lengkap         |
| Sekolah / token Guru | Admin UI/API; token 72 jam single-use, hash HMAC/legacy, revoke/reissue, race protection, rate limit Redis                 | Validasi lintas replica/outage/staging; tidak mengubah reusable class code menjadi single-use                           | Kuat secara teknis                                     |
| Kelas / afiliasi     | Guru verified membuat kelas, Student join kode, constraint satu kelas, ownership check                                     | Share/join melalui link dan QR belum ditemukan pada UI kelas; transfer/keluar tetap OPEN                                | Jalur kode tersedia; scope lebih luas parsial          |
| Drill                | Engine canonical, 10 soal, server score 80, save/clear/resume, version pin, submit/progress transaction                    | Level 2 kosong, warning refresh/exit, retry langsung dari hasil, XP/stars/retensi dan varian perlu alignment            | Fitur paling maju; belum seluruh Drill v1.2            |
| Progres / Penilaian  | Latest/best, unlock monotonic, history pagination, hasil tersimpan, dashboard API                                          | XP/star/policy fields, history per level, keterhubungan Pretest dan release TryOut                                      | Dasar terintegrasi                                     |
| Pretest              | Enum/schema, lifetime-completion constraint, history mengenali jenis Pretest                                               | Tidak ada API/journey start/skip/resume/submit/result; 20 soal, Skip semua subbab, placement/afiliation                 | Fondasi data saja                                      |
| TryOut               | Current package, single attempt, saved answers, server deadline, idempotent manual submit, waiting/result gate             | Class-required, PG-only, count 35 tidak ditegakkan, Past/detail/tutorial belum lengkap, countdown/auto-submit belum ada | Parsial dan berbeda dari PRD terbaru                   |
| IRT                  | Snapshot pseudonim, input/output validation, completion atomik/idempotent, Admin read                                      | Model, worker harian, per-student weighted result, release/SLA, low-response, approved scale/PGK input                  | Boundary integrasi; pipeline final belum ada           |
| XP                   | Ledger unik/versionable dan projection reader                                                                              | Finalisasi Drill/TryOut tidak mengisi ledger; formula OPEN; result belum menampilkan XP/pending                         | Belum menghasilkan reward                              |
| PvP                  | Gateway/engine, authoritative score/time, durable result, reconnect dan Redis tests                                        | DI policy `null`; akun produk tidak dapat mulai; OPEN-07 dan konten harus selesai                                       | Implementasi fixture teruji; disabled                  |
| Leaderboard          | Proyeksi hourly/archive WIB, sumber class DRILL/TRYOUT dipisah PvP, PvP top20/self                                         | Class endpoint masih policyPending/entries kosong; ledger kosong; PvP availability/policy pending                       | Fondasi projection; belum journey aktif                |
| Monitoring Guru      | Kelas sendiri, daftar/cari/sort siswa, detail level/latest/best                                                            | Feedback satu arah ≤1.000 karakter/read-state belum punya API/UI; kebutuhan riwayat lengkap perlu verifikasi            | Monitoring dasar tersedia                              |
| Video / report       | Maksimal 3 video READY saat gagal; UI/report idempotent, ownership dan version references; Admin resolve                   | Sandbox tanpa video; validasi hanya HTTPS, belum YouTube; kategori soal masih free text; event belum lengkap            | Parsial                                                |
| Admin operasi        | Sekolah/token; taxonomy/question/version/variant/video/report/IRT; Drill package API                                       | UI penerbitan paket Drill belum terhubung; operasi pengguna/kelas belum lengkap; ban/transfer OPEN                      | Banyak kapabilitas tersedia; tidak semuanya end-to-end |
| Analytics / worker   | PostgreSQL outbox, retry/delivery idempotent, hourly projection                                                            | Event Drill lengkap/report/video/explanation/Pretest belum diproduksi; alert dan job IRT/timeout belum tersedia         | Fondasi berjalan; producer/job parsial                 |
| UI / kualitas        | Shell responsive, focus assessment, identity cache isolation, loading/error/empty/access states; Chromium fixture coverage | State baru PRD, jaringan/expiry, mobile browser nyata, handoff final                                                    | Terintegrasi; acceptance baru belum lengkap            |
| Release / operasi    | CI, committed migrations, upgrade/bridge rehearsals, dokumentasi recovery                                                  | Deploy staging terpisah, Google real-flow, Curriculum, sekolah/izin, alert/load/restore release evidence                | Belum sign-off                                         |

## 6. Temuan review dan tindakan

Prioritas adalah **PROPOSED**: P0 menghalangi release scope terkait; P1 melengkapi MVP; P2 rapikan setelah critical flow stabil. P0 TryOut/Pretest/PvP tidak otomatis memblokir trial pertama yang hanya mencakup Drill.

| ID     | Prioritas / scope       | Temuan dan bukti                                                                                                                                                                      | Perbaikan / bukti yang dibutuhkan                                                                                                                     |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| GAP-01 | P0 trial/Drill          | Level 2 tanpa paket; `DrillAssessmentService.start()` mengembalikan `DRILL_PACKAGE_UNAVAILABLE` bila tidak ada paket playable                                                         | Konten Level 2 dan varian yang ditinjau; buktikan 8/10 → unlock → benar-benar mulai/selesai Level 2                                                   |
| GAP-02 | P0 trial/release        | Belum ada bukti Google + browser + API + DB sepanjang rantai tiga peran; E2E fixture bukan flow nyata                                                                                 | Google OAuth staging, resource denial lintas Guru/Siswa, result/progres durable dan callback/session tested                                           |
| GAP-03 | P0 TryOut               | `tryout.service.ts` mensyaratkan `classMemberships`; dashboard `tryout: !!membership`; UI meminta join kelas                                                                          | Hapus class prerequisite pada API/dashboard/UI; class snapshot nullable; update generated contracts, tests dan fixture Mandiri                        |
| GAP-04 | P0 TryOut               | Decoder dan save DTO hanya single-choice; start hanya memeriksa item nonempty; tidak ada 35-item check                                                                                | Model/DTO/validator/renderer ketiga format; paket 35 soal; rubrik PGK dari Curriculum; versi soal/policy dipin                                        |
| GAP-05 | P0 TryOut               | UI hanya menunjukkan waktu deadline; worker tidak punya timeout-finalizer                                                                                                             | Countdown dari deadline server; satu finalizer manual/auto, berjalan tanpa browser; save/submit/expiry race dan recovery tests                        |
| GAP-06 | P0 TryOut/IRT           | Submit menyimpan `normalizedScore(raw, maximum)` PG 0–100; IRT hanya gate akses. Completion IRT tidak mengisi `resultReleasedAt`                                                      | Initial weighted result dari Data pada skala disetujui; snapshot result/model; release service/job yang atomik dan immutable                          |
| GAP-07 | P0 TryOut/IRT           | Gate semua item `sampleSize >= 30`; belum ada pengukuran/release ≤72 jam dari batch end                                                                                               | PO/Data merekonsiliasi low-response vs SLA; Admin threshold dipisah dari student release; retry/alert tanpa partial score                             |
| GAP-08 | P0 Drill final policy   | `drill.policy.ts` masih star ≤50/≤90/100, score0=null, dan expiry 90 hari; UI menyebut 90 hari                                                                                        | Jangan jadikan nilai lama aturan baru. Pending policy/label demo yang jujur; setelah keputusan buat versi policy prospektif, pertahankan history      |
| GAP-09 | P0 Pretest MVP          | Constraint ada, endpoint dan UI belum ada                                                                                                                                             | Lifetime chapter eligibility, 20 soal, modal Mulai/Skip, tanpa XP, semua subbab Level 1 saat Skip; placement/Skip/afiliasi oleh owner                 |
| GAP-10 | P0 XP/class leaderboard | Tidak ada insert XP saat grading; `xp_ledger` kosong; class API mengembalikan pending kosong                                                                                          | Formula approved; satu ledger source/result; outbox atomik; idempotent XP, rebuild/projection/class data API; no PvP inclusion                        |
| GAP-11 | P0 PvP MVP              | `PvpModule` memberi `PVP_POLICY` nilai null                                                                                                                                           | Tutup OPEN-07 dengan PO/QA, versi policy produksi dan bank playable, lalu negative/reconnect/forfeit/dua disconnect E2E                               |
| GAP-12 | P1 Drill UX             | `AssessmentSession` tidak menangani warning refresh/exit; result tidak punya Retry langsung, retry lewat katalog                                                                      | Warning sesuai save yang dijamin; Retry gagal/completed di result; level detail/history dan exhausted variant state                                   |
| GAP-13 | P1 TryOut UX            | Hanya current endpoint/UI; belum Ongoing/Past/detail/tutorial lengkap. Bila paket kosong, respons hanya `{state: 'unavailable'}`; UI menganggap eligible false dan meminta join kelas | Listing semua status, metadata periode/deadline/batch/SLA; bedakan unavailable dari eligibility; Past execution sesuai TRY-TBC-05                     |
| GAP-14 | P1 support              | Video API/editor memvalidasi HTTPS umum, bukan YouTube; kategori laporan input bebas; data video kosong                                                                               | Curriculum menyediakan video; validasi YouTube dan kategori soal/opsi/kunci/pembahasan; konteks version/level/subbab/attempt, empty/error nonblocking |
| GAP-15 | P1 monitoring           | `feedback` baru schema; monitoring controller hanya GET progres                                                                                                                       | Backend feedback owned-class ≤1.000 karakter dan read-state ownership; UI Guru kirim, Student baca, negative tests                                    |
| GAP-16 | P1 kelas/Admin          | Kelas UI membagi kode saja; belum class link/QR. Admin controller belum operasi pengguna/kelas                                                                                        | Complete share/join link/QR dengan auth continuation; inventaris operasi Admin sesuai frozen scope, jangan menebak transfer/ban OPEN                  |
| GAP-17 | P1 analytics            | Producer Drill hanya `drill_completed`; report tidak insert analytics outbox; event list PRD lebih luas                                                                               | Mapping trigger/payload dengan Data, producer server untuk business events, frontend view/click tracking yang sesuai kontrak; dedup/retry             |
| GAP-18 | P0 release; P1 NFR      | Staging/handoff/operational sign-off belum terbukti; docs deployment bukan bukti deploy                                                                                               | Owner hosting/DB/Auth, fresh backup+restore, migration rehearsal, health/alert, beban sesuai target disepakati, browser nyata, sekolah/izin           |

Temuan GAP-03/04/05/06 adalah ketidaksesuaian runtime dengan rule yang sudah FINAL. Berbeda dengan GAP-07/08/09/10/11: sebagian pekerjaan menunggu keputusan owner. Menahan fitur saat OPEN tepat secara engineering, tetapi tidak boleh dihitung sebagai fitur MVP selesai.

## 7. Traceability seluruh 49 acceptance criteria

**Tercakup teknis** berarti ada implementasi dan/atau tes baseline yang mendukung perilaku itu; tidak berarti acceptance release terbaru sudah ditandatangani. **Parsial** berarti sebagian ada. **Gap** berarti hilang/berbeda dari PRD. Catatan OPEN membatasi aturan yang dapat difinalkan. Bukti utama: source files dan suite pada bagian 11.

### Drill v1.2 — 24 AC

| AC        | Status review                 | Bukti / pekerjaan tersisa                                                                    |
| --------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| DRL-AC-01 | Tercakup teknis               | Server memeriksa level eligible/locked; tetap perlu negative browser/API nyata.              |
| DRL-AC-02 | Parsial                       | Unique completion per Student/bab ada; Pretest journey/eligibility belum ada.                |
| DRL-AC-03 | Gap                           | Belum paket/attempt 20 soal dan no-XP flow Pretest.                                          |
| DRL-AC-04 | Gap                           | Belum Skip yang membuka Level 1 semua subbab secara idempotent.                              |
| DRL-AC-05 | Tercakup teknis               | Start menegakkan 10 item, UI satu soal + navigator; paket demo tersedia.                     |
| DRL-AC-06 | Tercakup teknis               | Count-up dari startedAt, tanpa pause/deadline Drill; verifikasi perubahan clock/offline.     |
| DRL-AC-07 | Gap + OPEN formula            | Bonus eligibility <15 menit belum menjadi output/policy reward; formula DRL-OPEN-01/02.      |
| DRL-AC-08 | Tercakup teknis               | Save/clear/update dan navigator; final session/expiry DRL-OPEN-05.                           |
| DRL-AC-09 | Tercakup teknis               | Native confirmation dan rejection sesudah graded; modal final UI masih dapat diperhalus.     |
| DRL-AC-10 | Parsial                       | Result/history submit idempotent; belum dapat membuktikan XP dedup karena XP belum dibuat.   |
| DRL-AC-11 | Tercakup teknis               | 80 unlock; playable kelanjutan Level 2 masih GAP-01.                                         |
| DRL-AC-12 | Parsial                       | <80 tidak unlock; retry engine/katalog ada, result belum CTA Retry langsung.                 |
| DRL-AC-13 | Tercakup teknis               | Unlock/completion terdahulu dipertahankan pada upsert progres.                               |
| DRL-AC-14 | Parsial + OPEN fallback       | Paket berikut berbeda dari sebelumnya; ekuivalensi akademik perlu Curriculum; DRL-OPEN-09.   |
| DRL-AC-15 | Tercakup teknis               | Record attempt terpisah, history cursor; versi pinned.                                       |
| DRL-AC-16 | Tercakup teknis               | `greatest` bestScore; latest/history dipisah.                                                |
| DRL-AC-17 | Parsial + OPEN policy         | Score/progress/stars lama tampil; XP/pending tidak ada; threshold stars TBC.                 |
| DRL-AC-18 | Tercakup teknis + gap retensi | Kunci/pembahasan sesudah submit; batas 90 hari masih legacy, DRL-OPEN-07.                    |
| DRL-AC-19 | Parsial                       | Server failed-only, max3, mapping subbab; katalog video kosong dan relevance perlu review.   |
| DRL-AC-20 | Parsial / gap YouTube         | UI membuka/report URL; backend hanya HTTPS, belum menjamin YouTube.                          |
| DRL-AC-21 | Parsial                       | Report ownership/idempotency/version ada; UI kategori wajib PRD dan konteks perlu alignment. |
| DRL-AC-22 | Gap                           | Belum warning refresh/exit sesuai actual saved/unsaved state.                                |
| DRL-AC-23 | Tercakup teknis               | Failed save bertuliskan Belum tersimpan, retry, submit ditahan; acknowledgement diperiksa.   |
| DRL-AC-24 | Gap + OPEN formula            | Ledger/projection ada, reward posting dari attempt tidak ada.                                |

### TryOut v1.1 — 25 AC

| AC       | Status review                   | Bukti / pekerjaan tersisa                                                                               |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| TRY-AC01 | Parsial                         | Current paket dapat ditampilkan jika ada; class gate salah dan sandbox tanpa paket.                     |
| TRY-AC02 | Gap                             | History attempt bukan daftar seluruh Past package termasuk never-attempted.                             |
| TRY-AC03 | Tercakup teknis                 | Current shared package, item pinned; bukti untuk fixture PG, bukan paket final.                         |
| TRY-AC04 | Tercakup teknis                 | DB unique Student/package dan start advisory lock.                                                      |
| TRY-AC05 | Gap                             | Tidak ada enforcement 35-item package.                                                                  |
| TRY-AC06 | Gap + OPEN rubrik               | PG saja; schema enum PGK tidak membuktikan validator/renderer/scoring PGK.                              |
| TRY-AC07 | Tercakup teknis untuk PG        | Satu soal dan navigator; perlu tiga format/35 item.                                                     |
| TRY-AC08 | Parsial                         | Saved answer dapat berubah sebelum final; saat deadline lewat save ditolak tetapi auto-final belum ada. |
| TRY-AC09 | Gap                             | Deadline disimpan, UI countdown tidak ada; durasi final TRY-TBC-01.                                     |
| TRY-AC10 | Gap                             | Tidak ada auto-finalization browser/server.                                                             |
| TRY-AC11 | Tercakup teknis                 | Manual submit menggunakan native confirmation.                                                          |
| TRY-AC12 | Parsial                         | Manual idempotent, manual/auto race belum dapat diuji karena auto path belum ada.                       |
| TRY-AC13 | Tercakup teknis                 | Graded attempt tidak menerima perubahan jawaban.                                                        |
| TRY-AC14 | Tercakup teknis dasar           | Submit menuju waiting tanpa score; success detail/submittedAt/batch timeline perlu lengkap.             |
| TRY-AC15 | Gap + OPEN batch/model          | Tidak ada release scheduler/SLA ≤72 jam dari batch end.                                                 |
| TRY-AC16 | Tercakup teknis + policy review | Result/key/explanation gated; universal threshold30 perlu diputuskan PO/Data.                           |
| TRY-AC17 | Parsial                         | Skor PG tersimpan tidak diubah IRT boundary; belum initial weighted immutable release pipeline.         |
| TRY-AC18 | Parsial                         | Label simulasi/score ada; score bukan weighted final dan XP tidak ada.                                  |
| TRY-AC19 | Gap + OPEN conversion           | Tidak ada XP posting/display; no bonus bukan bukti formula sudah diterapkan.                            |
| TRY-AC20 | Tercakup teknis                 | Unique attempt dan repeat-start returns existing, tanpa kesempatan baru.                                |
| TRY-AC21 | Tercakup teknis untuk manual    | Locks/constraints menahan duplicate start/submit; extension auto masih wajib.                           |
| TRY-AC22 | Tercakup teknis                 | Current package/release/close diperiksa; final period/deadline relationship TRY-TBC-06.                 |
| TRY-AC23 | Tercakup teknis dasar           | Pending state dan tidak ada partial score; delay/retry/batch timeline perlu lengkap.                    |
| TRY-AC24 | Tercakup teknis                 | Result menyatakan hasil simulasi dan bukan nilai TKA resmi.                                             |
| TRY-AC25 | Tercakup teknis                 | Tidak ditemukan checkout/payment pada journey TryOut.                                                   |

Akses gratis semua Student adalah rule FINAL TryOut §1/2/16 yang tetap harus diuji walaupun daftar AC tidak memiliki satu ID khusus untuk afiliasi. Retensi, kategori laporan, event dan detail/tutorial juga harus ditelusuri ke bagian PRD terkait. Jumlah AC bukan ukuran seluruh scope MVP; tidak diberikan persentase kemajuan tanpa bobot dan acceptance evidence yang disepakati.

## 8. Pembagian enam anggota

**Catatan supersession ownership:** bagian ini adalah usulan awal sebelum pengguna mengklarifikasi sembilan pekerjaan aktif Farel. Penugasan yang bertumpang tindih diganti oleh [joblist terbaru](MVP_JOBLIST_2026-10-02.md) dan [klarifikasi ownership](OWNERSHIP.md). Gunakan kedua dokumen tersebut untuk pelaksana aktif dan handoff; hasil audit di laporan ini tetap historis.

**Dasar:** [ownership lama](OWNERSHIP.md) dan konfirmasi pengguna bahwa pembagian itu tetap berlaku. Aini = Qurotul A'ini; aliwafa = Abdullah Ali Wafa. Farel sebelumnya menggantikan Wafa. **PROPOSED penyesuaian agar tidak tumpang tindih:** aliwafa kembali sebagai pelaksana UI onboarding/monitoring; Farel memimpin PM/integrasi browser dan koordinasi release. Tidak mengubah ownership historis pada file aslinya.

Andi, Tangguh, Nafi dan anggota lain tidak diasumsikan tersedia. Backend identity/feedback/Admin yang sebelumnya milik anggota tidak hadir dicatat sebagai penugasan sementara di bawah, bukan dianggap sudah dikerjakan. Tidak meminta anggota frontend mengimplementasikan domain authorization/scoring tanpa penugasan lintas divisi yang jelas.

### Ferdi — Core Learning frontend, support/content backend dan integrasi IRT

1. **F-01, mulai sekarang:** benahi Drill result/session: Retry gagal/completed langsung, refresh/exit warning, states pending XP/star/retensi yang disepakati, dan kelanjutan Level 2. Pertahankan score/progress dari server. **Selesai:** gagal-save tidak Saved; warning unsaved dapat diverifikasi; retry menyimpan history; 80 unlock tidak dicabut; result tidak menjanjikan policy TBC.
2. **F-02, paralel penyiapan konten:** koordinasikan data paket Level 2 dengan Curriculum, support publisher/API yang sudah ada, validasi YouTube/kategori report. **Selesai:** konten direview, paket dapat dimainkan dan diulang sesuai varian tersedia; laporan merujuk konteks nyata. Penulisan ke shared DB mengikuti workflow operator; audit ini tidak menerbitkan konten.
3. **F-03, setelah kontrak Aini tersedia:** TryOut UI Ongoing/Past → detail/tutorial/rules → PG/MCMA/Category → countdown → submission/waiting/released; jangan mensyaratkan kelas. **Selesai:** Mandiri/School sama-sama bisa, 35 controls sesuai tipe, reload mempertahankan deadline, auto-submit tanpa konfirmasi.
4. **F-04, setelah Data/PO freeze:** boundary IRT diperluas untuk PGK/per-student final result, XP result/pending UI, recommendation/report events; integrasi dengan worker Aini. **Selesai:** output/model/version valid, pseudonim, final result immutable; tidak menghitung ulang hasil released/historical.
5. **F-05, antrean berikut — PROPOSED lintas backend sementara:** feedback backend dan operasi Admin pengguna/kelas yang benar-benar masuk scope. Ini menggantikan kapasitas backend anggota tidak hadir; kerjakan sesudah jalur kritis Drill/TryOut, bukan bersamaan dengan semua F-01–04. **Selesai feedback:** kelas milik Guru, ≤1.000 karakter, Student sendiri membaca/read-state, negative tests. Policy ban/transfer tetap OPEN.

Reviewer backend utama Aini; UI/history partner Avicenna; QA Salim. Batasi satu pekerjaan besar aktif; content review dapat berjalan sambil menunggu kode.

### Aini — engine asesmen, worker, XP, PvP dan leaderboard backend

1. **A-01, mulai sekarang:** koreksi TryOut gratis semua Student dan metadata availability, susun kontrak PGK/35 soal, deadline dan finalizer manual/auto. Urutkan access + kontrak → timeout finalizer → dukungan format. **Selesai:** Mandiri diterima; package unavailable dibedakan dari affiliation; 35-item validation; timer mulai setelah attempt valid; finalizer bekerja tanpa browser dengan row lock/idempotency dan restart recovery.
2. **A-02, sesudah model/rubrik/batch approved:** orkestrasi IRT harian Admin dan batch release TryOut secara terpisah; initial weighted score/skala approved, immutable released result, retry/error/low-response dan SLA. Data menyediakan model, bukan Aini menebak statistik. **Selesai:** tidak ada skor/kunci sebelum release, raw submission utuh, late/failure terpantau, batch-end-to-release terukur.
3. **A-03, sesudah formula XP approved:** transactional ledger Drill/TryOut + outbox; output eligibility <15 menit untuk Drill, tanpa bonus durasi TryOut; proyeksi/ranks kelas nyata. **Selesai:** repeated/concurrent submission/release memberi satu ledger source; waktu WIB dan archive benar; PvP tidak masuk kelas.
4. **A-04, antrean setelah jalur TryOut stabil:** Pretest eligibility/start/skip/save/submit/result; 20 soal tanpa XP; Skip Level1 semua subbab; placement hanya setelah Curriculum/PO memutuskan. **Selesai:** lifetime chapter constraint, double-start/submit/skip aman, progres lama tidak turun, mapping unavailable jujur.
5. **A-05, antrean setelah policy/konten approved:** aktifkan PvP lewat policy version final, lalu leaderboard PvP; reuse engine/gateway yang sudah ada. **Selesai:** cross-affiliation, authoritative timer/score, reconnect20s/forfeit, dua disconnect sesuai keputusan, top20/self dan archive E2E.
6. **A-06, dukungan terbatas:** review regression identity/token/class backend yang sebelumnya milik Andi bila audit OAuth/integrasi menemukannya. Tidak membuka rewrite auth/kelas sebagai proyek baru tanpa bug konkret.

Reviewer backend Ferdi. Aini tidak menjalankan TryOut/IRT/XP/Pretest/PvP sebagai lima pekerjaan besar sekaligus. Jika semua harus selesai tanggal yang sama, Farel wajib mengangkat kebutuhan kapasitas atau perubahan milestone kepada PO.

### Farel — PM, integrasi browser dan koordinasi dependency/release

1. **PM-01, mulai sekarang:** decision sheet dengan owner, kebutuhan keputusan, tanggal, dampak dan evidence. Koordinasikan PO/Data/Curriculum untuk XP/stars/retensi, PGK/durasi/skala/IRT/batch/Past, placement/Skip/afiliation dan PvP. Farel mengatur keputusan bersama owner, tidak mengambil keputusan akademik sendiri.
2. **PM-02:** pastikan staging terpisah, owner hosting/domain, Database/Auth/Google callback, akun tiga peran, sekolah/izin dan konten reviewed. **Selesai:** ada owner dan evidence; Development sandbox tidak dipakai sebagai proyek trial pengguna sungguhan.
3. **PM-03:** integrasi flow browser Admin → Guru → Student → Drill → progres Guru bersama aliwafa/Avicenna/Salim; kelola defect dan urutan merge. **Selesai:** satu commit release candidate, generated contracts sama, blockers tercatat beserta penanggung jawab.
4. **PM-04:** dashboard backlog sederhana dengan status Implemented / Contract ready / Awaiting decision / QA verified / Release verified. Tetapkan milestone 12 Oktober berdasarkan gate; laporkan scope yang belum memenuhi PRD secara eksplisit.

Coding Farel tetap pendukung onboarding/browser ketika diperlukan; aliwafa menjadi DRI UI fitur tersebut. Hindari dua orang mengubah file layar yang sama tanpa koordinasi.

### aliwafa — onboarding dan monitoring frontend

1. **W-01, mulai sekarang:** tutup regression OAuth/callback, verifikasi Guru, join-class, session expired/logout/account-switch dan state 429/503. **Selesai:** flow tiga peran stabil di browser; invalid/expired/consumed/revoked token tidak membuka akses; lowercase/legacy capitalization tetap sesuai backend.
2. **W-02:** share kode/link/QR kelas dan join continuation sesudah Google login; empty/invalid/wrong-class state. **Selesai:** kode reusable banyak Student; satu kelas tetap ditegakkan server; link/QR hanya membawa kode, tanpa data Student/token Guru.
3. **W-03:** lengkapi monitoring Guru dan feedback UI setelah F-05 contract siap; Student inbox/read-state UI dikoordinasikan dengan Ferdi. **Selesai:** latest/best termasuk score0 benar, kelas sendiri saja, ≤1.000 karakter, save/error/read states nyata.

Reviewer frontend Farel/Ferdi; backend regression Aini, feedback Ferdi; Salim menulis acceptance lintas peran.

### Avicenna — Admin/Content frontend, Penilaian/history dan Pretest frontend

1. **V-01, mulai sekarang:** sambungkan existing Drill package API ke UI minimum untuk daftar/detail/draft/publish/archive dan dukung paket Level 2. Reuse Admin konten yang ada; jangan membuat ulang editor lengkap. **Selesai:** error readiness/review jelas, published package tidak diedit in-place, hasil lama tetap pinned, Student bisa memainkan paket baru. Ini kapabilitas operasional terpisah dari acceptance PRD siswa.
2. **V-02:** Penilaian/history: latest versus best, per-level context, semua attempt valid, pending/released TryOut, policy-pending XP/star, pagination dan history/error states. **Selesai:** tidak ada overwrite history, skor TryOut tidak bocor sebelum release, jenis Pretest tidak menuju result route yang belum tersedia.
3. **V-03, setelah A-04 contract:** Pretest info Mulai/Skip, 20-question attempt, completed/skipped/mapping-unavailable/result, CTA ke subbab. **Selesai:** tidak menawarkan reattempt completed, Skip seluruh subbab Level1, tidak menampilkan placement fiktif atau XP.
4. **V-04, antrean berikut:** Admin reports/video/IRT states dan operasi pengguna/kelas berdasarkan backend final yang tersedia. Tidak menambahkan dashboard perubahan mastery/XP/limit/reset atau policy transfer/ban yang belum approved.

Reviewer frontend Ferdi; API konten/support Ferdi dan Pretest Aini. Jangan memulai V-03 dengan response types buatan sendiri sebelum kontrak.

### Salim — QA acceptance, regresi, E2E dan bukti release

1. **Q-01, mulai sekarang:** ubah 49 AC pada laporan ini menjadi checklist testcase/evidence berdasarkan source; bedakan fixture, database integration dan staging nyata. Tambahkan free TryOut access sebagai rule §1/2/16.
2. **Q-02:** prioritaskan trial chain nyata: Google/role, token single-use72h/race, one-class, cross-class denial, save/re-auth, 7/10 vs8/10, unlock lalu play Level2, latest/best dan historical pinning. **Selesai:** test evidence pada satu release SHA, target/env jelas dan repro defect tersedia.
3. **Q-03:** per kontrak baru uji 35 PG/MCMA/Category, double-start/submit, manual-auto race, browser ditutup saat expiry, clock/network/offline, pending/late/low-response IRT, released immutable score, ledger/outbox dedup, weekly boundary WIB.
4. **Q-04:** Pretest Skip/completed/mapping; feedback ownership/read-state; PvP reconnect/forfeit/dua disconnect; class versus PvP ranks. Uji hanya policy approved atau fixture berlabel; jangan mengesahkan policy OPEN dari passing fixture.
5. **Q-05:** device/browser dan aksesibilitas, release checklist, restore/migration evidence dan load scenarios bersama operator/pemilik modul. **Selesai:** semua critical gate scoped release lulus; defect critical nol; noncritical accepted oleh owner dengan catatan.

Pemilik fitur tetap menulis unit/integration tests. Salim memimpin acceptance lintas modul, bukan menjadi satu-satunya penulis seluruh tes atau pemilik konfigurasi cloud.

## 9. Urutan kerja dan dependency

**PROPOSED sasaran evaluasi**, menggunakan WIB dan target sekitar 12 Oktober yang tercatat. Tanggal bukan estimasi yang sudah divalidasi; jika input belum tersedia, gate tetap gagal dan target harus dievaluasi bersama.

| Window        | Fokus / output                                                                                   | DRI                                                              | Gate                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 2–3 Oktober   | Freeze daftar gap, kontrak awal, decision sheet, owner/akses staging, konten Level2              | Farel + semua owner                                              | Keputusan pending memiliki owner/deadline; konten/release scope tidak diasumsikan |
| 3–5 Oktober   | Trial Drill lengkap, konten reviewed, Level2 playable, warning/result alignment, Google flow     | Ferdi, aliwafa, Avicenna; Salim verifikasi; Aini backend support | Admin→Guru→Student→Drill→Guru berhasil, authorization/persistence80 lulus         |
| 5–8 Oktober   | TryOut access/35/PGK/countdown/finalizer dan IRT/XP sesuai readiness kontrak/model               | Aini + Ferdi; Avicenna history; Farel Data coordination          | Manual/auto idempotent; Data output approved; pending/release boundary benar      |
| 8–10 Oktober  | Acceptance/bugfix release candidate; Pretest/PvP/feedback hanya jika antrean dan policy siap     | Pemilik modul + Salim                                            | Tidak menganggap fitur antrean selesai; critical flow/regression sesuai scope     |
| 10–11 Oktober | Staging Google real-flow, operasi backup/restore/health/alert, device tests, Curriculum/sign-off | Farel + Salim + operator + owner                                 | Bukti release terikat SHA/env; tidak ada critical blocker                         |
| 12 Oktober    | Keputusan go/no-go per scope                                                                     | PO/PM/Software/QA/operator                                       | Trial pertama dan MVP penuh mendapat penilaian terpisah                           |

Urutan dependency penting:

- Konten reviewed → package published/playable → unlock lalu start Level2 → acceptance trial.
- API/answer contract → generated types → PGK controls/renderer → rubric/scoring tests.
- Approved batch/model/scale → weighted result snapshot → immutable release → XP ledger → class leaderboard.
- Pretest affiliation/Skip/placement decision → lifecycle API → UI → lifetime/skip E2E.
- PvP policy/konten → activation server → real transport/match E2E → global leaderboard acceptance.

Pekerjaan generic contract, error/pending UI, finalization infrastructure dan test harness dapat berjalan sebelum semua formula disetujui. Perilaku akademik final, scoring resmi, placement dan output reward tidak boleh diterbitkan dengan angka tebakan.

## 10. Keputusan yang harus diminta kepada owner eksternal

| Keputusan / input                                                           | Owner keputusan                                          | Pelaksana koordinasi                  | Diperlukan sebelum                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Konten Level1/2, struktur materi, variant equivalence/pool, video           | Curriculum + PO/Data terkait                             | Farel; Ferdi/Avicenna implementasi    | Trial/content acceptance; retry final                            |
| Drill XP/base/gagal/bonus, star thresholds, retention                       | PO + Data/Product terkait                                | Farel; Aini/Ferdi konsumsi            | Reward/result final; tanpa menjadikan legacy formula policy baru |
| Save/expiry/Exit, Pretest setelah Skip/afiliasi/placement                   | Software + PO/UIUX/Curriculum terkait                    | Farel; Aini/Ferdi/Avicenna/aliwafa    | Session/Pretest final                                            |
| TryOut durasi, komposisi/rubrik PGK, skala TKA, Past eligibility            | Research/Curriculum + PO                                 | Farel; Aini/Ferdi konsumsi            | Paket/scoring/flow TryOut final                                  |
| IRT model/PGK input/per-user output, low-response, batch end/retry/release  | Data + PO/Curriculum terkait                             | Farel; Ferdi boundary, Aini scheduler | Weighted score/SLA release; bukan software mengarang model       |
| PvP expiry/readiness/disconnect edges dan tie ranking                       | PO + Software + QA                                       | Farel; Aini/Ferdi/Salim               | PvP/leaderboard final                                            |
| Hosting/domain/staging Auth/DB, sekolah/izin dan performance/restore target | Tim/PO + operator Database/DevOps/Product/Design terkait | Farel; Salim evidence                 | Real-user trial/release                                          |

Data/Curriculum/PO/DevOps/Database bukan anggota yang diasumsikan hadir untuk coding. Mereka tetap dependency nyata. Bila tidak dapat memberi input tepat waktu, PM mencatat dampaknya pada gate; tidak mengalihkan kewenangan akademik ke enam engineer.

## 11. Evidence kode dan tes untuk review tim

| Evidence                                                                                                                                                                                                                                                                     | Fungsi review                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [drill-assessment.service.ts](../../apps/api/src/modules/learning/drill-assessment.service.ts), [drill.policy.ts](../../apps/api/src/modules/learning/drill.policy.ts)                                                                                                       | Eligibility, package/error, grading/progress/history, legacy stars/90-day expiry                  |
| [tryout.service.ts](../../apps/api/src/modules/learning/tryout.service.ts), [tryout-release.service.ts](../../apps/api/src/modules/learning/tryout-release.service.ts), [tryout.controller.ts](../../apps/api/src/modules/learning/tryout.controller.ts)                     | Class gate, single-choice, count/deadline/manual result, threshold/release gate, current-only API |
| [student-dashboard.service.ts](../../apps/api/src/modules/learning/student-dashboard.service.ts)                                                                                                                                                                             | Server availability masih class-only TryOut; Pretest/PvP/class ranks false                        |
| [assessment-session.tsx](../../apps/web/src/features/core-learning/assessment-session.tsx), [drill.tsx](../../apps/web/src/features/core-learning/drill.tsx), [tryout.tsx](../../apps/web/src/features/core-learning/tryout.tsx)                                             | Save/confirmation/navigator, count-up/result, countdown/detail/Past gap, incorrect class UI       |
| [assessment-history.tsx](../../apps/web/src/features/core-learning/assessment-history.tsx), [catalog.tsx](../../apps/web/src/features/core-learning/catalog.tsx)                                                                                                             | History pagination, retry through catalogue, no separate final Pretest journey                    |
| [student-support.service.ts](../../apps/api/src/modules/reports/student-support.service.ts), [support.tsx](../../apps/web/src/features/core-learning/support.tsx)                                                                                                            | Max3 failed-only/video HTTPS, report idempotency/category/context                                 |
| [drill-packages.service.ts](../../apps/api/src/modules/content/drill-packages.service.ts), [Admin UI](../../apps/web/src/features/admin/content.tsx)                                                                                                                         | Publisher readiness/version guard; UI package integration gap                                     |
| [irt-integration.service.ts](../../apps/api/src/modules/irt/irt-integration.service.ts), [worker main](../../apps/worker/src/main.ts), [outbox.ts](../../apps/worker/src/outbox.ts)                                                                                          | Snapshot/output boundary, no release on completion; runtime jobs outbox/projection only           |
| [pvp.module.ts](../../apps/api/src/modules/pvp/pvp.module.ts), [pvp.policy.ts](../../apps/api/src/modules/pvp/pvp.policy.ts), [leaderboards.service.ts](../../apps/api/src/modules/leaderboards/leaderboards.service.ts)                                                     | Null PvP policy; class ranks pending; real product activation gap                                 |
| [monitoring.controller.ts](../../apps/api/src/modules/monitoring/monitoring.controller.ts), [Teacher UI](../../apps/web/src/features/monitoring/teacher-screens.tsx), [support schema](../../packages/database/src/schema/support.ts)                                        | Progress query and feedback schema-only, code-only class share                                    |
| [assessments schema](../../packages/database/src/schema/assessments.ts), [engagement schema](../../packages/database/src/schema/engagement.ts), [demo-learning.ts](../../packages/database/src/demo-learning.ts)                                                             | Uniqueness/pinning/ledger; seed builds Level1 packages but no Level2 package                      |
| [learning flow suite](../../apps/api/src/modules/learning/learning.flow.integration.spec.ts), [TryOut suite](../../apps/api/src/modules/learning/tryout.flow.integration.spec.ts), [teacher flow suite](../../apps/api/src/modules/schools/teacher-flow.integration.spec.ts) | Database-backed domain evidence using fixture policies/identity                                   |
| [IRT suite](../../apps/api/src/modules/irt/irt-integration.integration.spec.ts), [PvP transport suite](../../apps/api/src/modules/pvp/pvp.transport.integration.spec.ts), [worker tests](../../apps/worker/src/class-leaderboard.spec.ts)                                    | Boundary/transport/projection validation, bukan final product policy approval                     |
| [Chromium E2E](../../apps/web/e2e/student.spec.ts), [CI workflow](../../.github/workflows/ci.yml)                                                                                                                                                                            | 13 browser cases with intercepted APIs; DB/Redis tests and full quality gates on CI               |
| [Release Checklist](../operations/RELEASE_CHECKLIST.md), [QA Guide](../testing/QA_GUIDE.md), [QA Seed](../testing/QA_SEED.md)                                                                                                                                                | Release gates, AC mapping, historical Development smoke and Google limitations                    |

Definition of Done tetap mencakup review kode, kontrak/migrasi, lint/typecheck/build, critical-rule/authorization tests, relevant UI states, docs, dan alur QA yang dapat diulang. Laporan ini menambahkan hasil audit dan usulan tugas; tidak mengubah source PRD, approved ownership, `.env`, kontrak, migration, kode aplikasi atau database.
