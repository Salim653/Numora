# Audit ulang perubahan Ferdi — 1 Oktober 2026

**ENGINEERING AUDIT:** cakupan adalah diff tiga PR Ferdi terhadap `origin/main` yang diperbarui pada audit, yaitu `4f912cf`. Audit tidak mengubah aturan PRD, menutup OPEN, menerapkan migrasi cloud, atau melakukan merge ke main.

## Hasil dan cakupan ownership

Tidak ada temuan penghambat kode yang tersisa dalam cakupan pemeriksaan setelah perbaikan dan regresi di bawah. Bukti ini mendukung review merge; persetujuan reviewer dan acceptance browser lintas peran tetap diperlukan sesuai Definition of Done.

Paket Drill/Admin Content, dukungan frontend Student, laporan/video, integrasi IRT, dan pembaruan docs sesuai penugasan Ferdi yang disetujui pada OWNERSHIP 1 Oktober. Frontend Admin/Pretest/Penilaian tetap Avicenna; onboarding/join kelas tetap Farel; identity/kelas tetap Andi; engine canonical, XP/outbox, scheduler, PvP/leaderboard backend tetap Qurotul; model statistik tetap Data. Perubahan audit tidak mengimplementasikan kebijakan di area tersebut.

## Temuan yang diperbaiki

| Temuan                                                                                                | Perbaikan                                                                                                                                                         | Bukti regresi                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| DTO paket menganggap varian/policy selalu non-null walaupun schema dan paket legacy mengizinkan null. | Response/generated types mengikuti nullable schema; draf tanpa konfigurasi ditolak sebelum publikasi.                                                             | Pembacaan legacy dan kode `DRILL_PACKAGE_NOT_READY`; histori attempt/item/versi diperiksa setelah revisi/arsip.                                |
| Retry laporan setelah respons jaringan hilang dapat menambah laporan sama.                            | UUID `clientRequestId` opsional menjadi primary key, dilindungi advisory lock dalam transaksi. UI menggunakan ID sama pada retry dan ID baru setelah isi berubah. | Dua request concurrent menghasilkan satu row; actor/referensi/isi berbeda ditolak; retry setelah mapping diarsipkan tetap memeriksa ownership. |
| URL video READY dari impor dapat melanggar aturan HTTPS editor.                                       | Metadata yang akan diberikan kepada Student diperiksa kembali dengan validasi HTTPS.                                                                              | Metadata `javascript:` tidak muncul dalam rekomendasi.                                                                                         |
| Ekstraksi IRT hanya memeriksa waktu selesai attempt; grading setelah cutoff dapat masuk.              | Waktu selesai dan grading keduanya harus tidak melewati cutoff; timezone input wajib eksplisit.                                                                   | Respons terlambat dikeluarkan; retry tetap memakai snapshot awal; timestamp tanpa timezone ditolak.                                            |
| Parameter finite masih dapat melampaui kapasitas `numeric(12,6)` dan memicu error database.           | Nilai yang tidak dapat disimpan setelah pembulatan ditolak dengan 400 sebelum mutation.                                                                           | Batch tetap PENDING setelah output invalid; validasi UUID pada readiness juga diperiksa.                                                       |
| Parameter legacy berstatus `NOT_ENOUGH_DATA` masih terlihat pada sample ≥30.                          | Status tersebut selalu disamarkan. Status legacy lain mempertahankan aturan sebelumnya: sample ≥30 dan batch SUCCEEDED.                                           | Kasus insufficient legacy dan tes existing status TEST keduanya lulus; tidak memaksakan enum model baru kepada Data.                           |
| Query metadata batch/readiness/failure memuat JSON snapshot besar yang tidak dibutuhkan.              | SELECT hanya memuat kolom yang diperlukan.                                                                                                                        | Review query dan tes pembacaan status/penyembunyian snapshot. Ini bukan benchmark beban produksi.                                              |
| Transaksi laporan video memakai query di luar koneksi transaksi sehingga berisiko menghabiskan pool.  | Seluruh query ownership/rekomendasi menggunakan reader transaksi yang sama.                                                                                       | Dua belas request laporan video serentak harus selesai 201, melampaui kapasitas default pool 10.                                               |

Tes reproduksi sebelum perbaikan menunjukkan lima kegagalan pada skenario tambahan. Pemeriksaan cache menemukan `StudentGate` sudah mengganti QueryClient per sesi; perilakunya dipertahankan dan ditambah tes pergantian token. Tidak ada perubahan pada AuthProvider milik onboarding.

## Verifikasi

- `pnpm run ci` lulus: 74 tes, validasi kontrak/generated types, lint, typecheck, dan production build. Rinciannya 3 root, 2 database, 40 API, 29 web.
- Suite terarah lulus: 13 tes backend paket/laporan/IRT dan 9 tes frontend hasil/lanjut level/laporan.
- `pnpm openapi:generate` menghasilkan JSON identik dengan kontrak final; `pnpm contracts:types:check` lulus.
- `db:upgrade-check` dan `db:staging:bridge-check` lulus pada cluster PostgreSQL localhost khusus pengujian. Data Drill lama bertahan; tidak ada perubahan schema tambahan selain migrasi 0004 yang sudah disiapkan.
- Tes authorization, input tidak terpercaya, concurrent publication/report retry, rollback audit, pinning histori, sample 29/30, kegagalan/retry IRT, save sebelum submit, akses 401/403, paket berikutnya belum tersedia, dan isolasi cache sesi tercakup.
- Pemeriksaan HTTP development memeriksa kompilasi route tanpa login; hasil HTTP 200 bukan bukti alur authenticated atau persistence browser.
- Pemeriksaan diff/format dan tautan dependency menjaga source serta node_modules workspace utama terpisah dari worktree verifikasi. Tidak ada secret atau perubahan `.env` dalam diff.

Bukti lokal berada di `D:\numora-ferdi-tests-20261001`: `audit-red.log`, `audit-green-api.log`, `audit-green-web.log`, `audit-ci-final.log`, `audit-openapi-final.log`, `audit-upgrade.log`, dan `audit-bridge.log`. Folder ini bukan bagian PR atau artifact publik.

## Gate merge dan integrasi

Review/merge berurutan: [PR #22](https://github.com/ayiinee/Numora/pull/22), [PR #23](https://github.com/ayiinee/Numora/pull/23), [PR #24](https://github.com/ayiinee/Numora/pull/24). CI pada head terbaru masing-masing PR wajib lulus dan reviewer pemilik terkait memeriksa handoff. Audit sendiri tidak menggantikan persetujuan reviewer.

Paket canonical belum dikonsumsi engine Student; laporan soal legacy masih menunggu migrasi canonical. API Tryout/PvP/leaderboard final dan agregasi dashboard lengkap tetap dependensi. Batch IRT SUCCEEDED tidak melepas hasil Tryout atau mengubah nilai/XP historis; OPEN-12/18 dan review kontrak Data tetap terbuka. Client laporan lama tanpa clientRequestId tetap diterima, dengan batas retry yang terdokumentasi.

Operator Database menerapkan migrasi 0004 melalui prosedur tim sebelum fitur metadata batch/integrasi IRT digunakan. Operator menyiapkan IRT_PSEUDONYM_KEY server-only sebelum scheduler memanggil prepare. Tidak ada pemanggilan cloud atau migration/seed otomatis dalam audit.

Automation browser belum dapat dipakai: browser `iab` tidak tersedia, sedangkan Chrome gagal memulai app-server dengan `os error 3`. Fixture UI lokal sementara tidak dimasukkan ke PR. Keyboard/responsivitas dan E2E authenticated lintas peran tetap memerlukan bukti QA browser sebelum rilis. Skenario QA lengkap tersedia di [FERDI_CONTENT_SUPPORT](../api/FERDI_CONTENT_SUPPORT.md).
