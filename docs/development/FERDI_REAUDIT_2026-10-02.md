# Audit ulang perubahan Ferdi — 2 Oktober 2026

Audit diminta pengguna atas PR #42 (konten), #43 (backend), dan #44 (Student). Baseline main `33410fb`; implementasi sebelum audit `bb69f50`. Scope dibandingkan dengan OWNERSHIP, joblist, Drill v1.2/TryOut v1.1, OPEN register, ADR outbox/versioning, kontrak generated, schema dan tes existing. Audit ini adalah review penulis implementasi, bukan approval independen maintainer, QA Salim, atau bukti deployment.

## Temuan dan perbaikan

| Temuan | Dampak sebelum perbaikan | Perbaikan dan bukti regresi |
| --- | --- | --- |
| TryOut background polling gagal melepas form | Draft jawaban yang belum tersimpan dan warning dapat hilang ketika koneksi gagal; remount juga memulai ulang tampilan timer dari snapshot lama | Form dengan data terakhir dipertahankan ketika refetch gagal; status recovery nonblocking. Tes mempertahankan pilihan, save error, timer dan beforeunload warning, lalu memulihkan save tanpa submit otomatis palsu |
| Jawaban belum terkunci selama perpindahan halaman sesudah submit sukses | Setelah request selesai, kontrol aktif kembali sebelum router menyelesaikan navigasi | Guard synchronous finalizer dan disabled saat success menjaga jawaban/manual submit terkunci; tes menunda navigasi dan membuktikan tidak ada save/submit tambahan |
| State/acknowledgement PvP lama terbawa perubahan koneksi/match | ACK tertunda dapat menavigasi ke room lama; snapshot room lama dapat menimpa match baru | Response hanya diterima dari socket aktif dan match yang sesuai; state/reset saat koneksi berganti. Request ID tetap pada renewal token akun yang sama, dihapus pada perpindahan match/disable. Tes late ACK + same-ID retry dan perubahan match + foreign snapshot |
| Fallback countdown reconnect berisi teks encoding rusak | Label tidak terbaca bila angka belum tersedia | Fallback sederhana `-`, tanpa mengarang countdown atau hasil forfeit |
| Default pagination dokumentasi salah | Consumer diarahkan ke default 50 padahal shared ContentPageDto memakai 20 | Dokumen diselaraskan ke limit 1–100, default 20, offset 0–1.000.000 |

Perbaikan berada di consumer Student/teks handoff PR #44. Tidak mengubah engine, scoring, finalizer server, ledger, backend PvP, policy atau login/route/navigation Farel. PR #42/#43 tetap terpisah dan tidak direwrite.

## Pemeriksaan scope dan keamanan

| Area | Hasil audit |
| --- | --- |
| Konten/publisher | 40 kandidat memenuhi schema/kunci/persamaan/distraktor dan label DEMO/DRAFT; tidak ada seed/publication otomatis. Review Curriculum dan kesetaraan akademik tetap dependency |
| Drill/session/result | Start/retry memakai API canonical; server menentukan attempt, best/unlock dan history; 7/10 vs 8/10, duplicate submit, locked denial, pinning dan retry covered existing database suite. Tidak ada expiry/abandon/local-storage guarantee baru; warning browser Back tetap tidak dijanjikan |
| TryOut | Clock memakai serverTime/deadline + elapsed monotonic, bukan jam perangkat; manual/auto berbagi finalizer UI; persisted status/release tetap server-authoritative. Backend class-only/PG, Past/35 PGK, unattended finalizer dan policy final tetap gap Aini yang terdokumentasi, tidak dibypass |
| IRT | V1 default tetap; V2 internal opt-in/proposed. Identity/model/batch/policy/scale/output tervalidasi; snapshot/replay/conflict dijaga; completion tidak membuka result, mengubah historical score atau memberi XP |
| Video/report | URL HTTPS YouTube memakai parser/allowlist; metadata impor invalid tidak dapat diaktifkan. Filter sebelum cap tiga; empat kategori; ownership, request replay/conflict dan konteks server; laporan/outbox satu transaksi |
| Feedback/history | Teacher aktif/verified hanya ke Student aktif dalam kelas/sekolah/membership yang berhak; create/read concurrency idempotent. Inbox milik Student. History/cursor Guru memakai classIdAtStart; tidak membocorkan history kelas sebelumnya |
| Admin | Seluruh route baru memakai Active Admin guard; query parameterized, wildcard escaped, pagination bounded; email/auth ID/join code/token tidak dikirim. Ban/transfer/afiliasi belum ditambahkan |
| PvP/leaderboard | Availability/policyPending tetap server-gated; tidak ada timer/score/forfeit/tie/rank yang diputuskan client. Lifetime koneksi/ACK dan match isolation diperketat. Archive/live two-browser acceptance tetap dependency |
| Analytics | Producer mapping PROPOSED dan gate default off. Business mutation/outbox atomik; request ID dedup/conflict; actor/context ditentukan server. Existing consumer Aini dipakai, tanpa queue/dual-write kedua |
| Schema/versioning | Snapshot 0009→0010 hanya menambah nullable irt_batches.output_snapshot; 0010→0011 hanya nullable video_reports.attempt_context. Kolom/constraint lama tidak berubah; SQL/journal historis tetap. Existing fork/repeat/legacy upgrade suites menjaga data |
| Shared files/ownership | Tidak ada diff `.env`, lockfile, migrasi 0000–0009, onboarding, monitoring, route/app atau shared shell. Ownership tambahan feedback/Admin tetap approval pengguna; UI aliwafa/Avicenna dan sembilan tugas Farel tidak diambil ulang |

## Verifikasi setelah perbaikan

- Local `pnpm run ci` lulus: root 4, database 8, API 79, web 55, worker 4; lint/typecheck/build/contract freshness lulus. Lima tes Redis dilewati lokal karena tidak tersedia Redis terisolasi. CI GitHub existing menyediakan PostgreSQL/Redis terisolasi untuk menguji API 84 tanpa skip.
- Playwright Chromium 17/17 lulus setelah perubahan runtime, termasuk 35 PG TEST ONLY/countdown/reload/lost ACK, Drill save recovery/Retry dan viewport 320/360/390/768/1440.
- Regresi tambahan memverifikasi background fetch gagal tidak menghilangkan draft, lock pasca-submit, late PvP ACK pada renewal token, serta state dari match berbeda. Unit tests tidak mengklaim live OAuth/PvP activation.
- Validator konten lulus 40 draft; diff whitespace/kontrak dan metadata migrasi diperiksa. Tidak memakai database bersama/staging atau `.env` pengguna untuk tes mutatif.
- Log lokal: `D:/numora-ferdi-runtime-20261002/ci-reaudit.log` dan `browser-reaudit.log`. Status CI untuk SHA audit terakhir harus diperiksa di [PR #44](https://github.com/ayiinee/Numora/pull/44) sebelum merge; evidence CI terdahulu tetap historis.

## Penilaian merge

Tidak ditemukan blocker teknis tersisa dalam perubahan yang diaudit setelah perbaikan dan pemeriksaan lokal. Ini bukan jaminan bebas seluruh bug atau approval maintainer. Perubahan dapat diajukan untuk merge bertahap setelah review Aini/owner terkait dan required checks pada head/merge target terakhir lulus: #42 → #43 → #44. Sesudah setiap PR dasar merge, retarget/rebase PR berikutnya ke main terbaru tanpa kehilangan perubahan, lalu jalankan checks yang diwajibkan; GitHub tidak otomatis memindahkan base branch yang masih ada.

Tidak mengaktifkan analytics PROPOSED/PvP atau mempublikasikan konten draft sebagai approved. Gate Curriculum/Data/PO, TryOut/reward/archive Aini, consumer aliwafa/Avicenna, QA independen Salim, visual handoff dan operator tetap Awaiting dependency. Merge kode ini tidak berarti MVP penuh atau staging/release verified. Backup/rehearsal dan migrator canonical 0010/0011 wajib pada environment yang disetujui operator sebelum runtime membutuhkan schema tersebut.
