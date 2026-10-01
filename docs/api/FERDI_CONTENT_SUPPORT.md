# Paket Drill, dukungan Student, dan integrasi IRT

**ENGINEERING IMPLEMENTATION — 1 Oktober 2026, menunggu review FE/BE/QA.** Implementasi ini mengikuti ownership Ferdi. Aturan produk tetap mengikuti PRD v0.5; kontrak integrasi statistik belum menjadi persetujuan model Data.

Semua endpoint memakai `/api/v1`, Bearer Auth, UUID, JSON camelCase, dan error `application/problem+json`. Identitas actor/reporter diambil dari sesi server. Tipe frontend dihasilkan dari OpenAPI.

## Paket Drill canonical — #3

Endpoint di bawah memerlukan Admin aktif:

| Method/path                                       | Perilaku                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `GET /admin/content/drill-packages`               | Daftar dengan `offset`/`limit`.                                                                                          |
| `GET /admin/content/drill-packages/{id}`          | Metadata dan versi soal berurutan.                                                                                       |
| `POST /admin/content/drill-packages`              | Draf: `familyCode`, `packageVersion`, `name`, `levelId`, `variantIndex`, `scoringPolicyVersionId`, `questionVersionIds`. |
| `PATCH /admin/content/drill-packages/{id}`        | Mengganti nama, policy, dan item draf. Scope level/varian/family/version tetap.                                          |
| `POST /admin/content/drill-packages/{id}/publish` | Publikasi atomik dengan row lock; retry paket PUBLISHED mengembalikan ID sama.                                           |
| `POST /admin/content/drill-packages/{id}/archive` | Mengarsipkan tanpa menghapus item/history; tidak dapat diterbitkan ulang.                                                |

**PRD RULE:** Drill memiliki 10 soal PG pada cakupan MVP yang didukung. Versi konten dan penilaian yang dipakai attempt harus dipertahankan.

**ENGINEERING IMPLEMENTATION:** draf boleh belum lengkap. Publikasi membutuhkan tepat 10 versi unik SINGLE_CHOICE dari kompetensi subbab level, ancestry/keluarga/kompetensi READY, review versi soal tercatat, dan payload teks/opsi/kunci/pembahasan valid. Versi scoring policy harus PUBLISHED dengan `configuration.assessmentType = "DRILL"`. Field ini menyatakan kompatibilitas tipe; formula dan versi policy disiapkan pemilik engine, bukan diatur melalui UI paket. Bobot item PG bernilai 1. Jumlah opsi tidak dikunci ke empat oleh publisher; editor prototipe yang ada tetap mendukung A–D.

Keluarga paket mempertahankan tipe, level, dan variantIndex. Revisi paket terbit menggunakan `POST` dengan family sama dan packageVersion baru. Update draf, publikasi, dan arsip dilindungi transaksi; kegagalan audit membatalkan mutasi. Publikasi berulang tidak membuat paket/versi baru, tetapi setiap request mutasi Admin yang berhasil tetap diaudit.

**DEPENDENCY:** paket ini berada di `assessment_packages`/`package_items`. Learning Student saat ini membaca tabel kompatibilitas `drill_*`. Migrasi dan konsumsi engine canonical milik Qurotul. Tidak ada dual-write, migrasi attempt, seed cloud, atau perubahan scoring dari pekerjaan ini.

## Video dan laporan Student — #11

| Method/path                                          | Input/hasil                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET /students/me/drill-attempts/{attemptId}/videos` | `{items:[{mappingId,title,url,source}]}`; hanya hasil Drill milik Student, maksimal tiga mapping/video READY menurut urutan kurasi. |
| `POST /students/me/question-reports`                 | `{attemptItemId,category,details?}`; mengembalikan `{id}`.                                                                          |
| `POST /students/me/video-reports`                    | `{attemptId,mappingId,category,details?}`; mengembalikan `{id}`.                                                                    |

**PRD RULE:** video direkomendasikan ketika skor Drill <80; tanpa video hasil tetap tersedia. Laporan merujuk item/versi atau mapping sebenarnya. Student tidak mendapat daftar laporan atau notifikasi tindak lanjut pada MVP.

Rekomendasi mendukung pembacaan hasil canonical maupun hasil Drill kompatibilitas. Pertanyaan belum dinilai/Drill belum selesai tidak menghasilkan rekomendasi. Laporan video harus menunjuk salah satu rekomendasi yang valid untuk attempt milik pelapor.

Laporan soal mencari item canonical milik Student dan answer tersimpan, lalu mengisi FK `question_reports.attempt_answer_id`. Item tidak tersedia ditolak `404 REPORT_ITEM_NOT_FOUND`; answer belum tersimpan ditolak `409 REPORT_ANSWER_UNAVAILABLE`. ID pertanyaan Drill kompatibilitas tidak diubah menjadi FK palsu. Form frontend sudah tersedia, tetapi pengiriman untuk Drill kompatibilitas menunggu migrasi Qurotul; kegagalan tampil dan dapat dicoba ulang. Admin membaca/menindaklanjuti laporan melalui API Reports yang sudah ada.

**ENGINEERING IMPLEMENTATION:** category adalah teks 1–80 karakter; details opsional maksimal 2.000 karakter. Ini batas input engineering, bukan daftar kategori produk final. Jangan memasukkan PII dalam laporan. Form mencegah submit bersamaan; retry setelah respons jaringan hilang masih dapat membuat laporan terpisah karena belum ada kontrak idempotency-key laporan.

## Integrasi IRT — #9

`IrtModule` mengekspor `IrtIntegrationService` untuk orchestrator/worker Qurotul. Tidak ada endpoint publik untuk menyuntikkan statistik.

| Layanan                                                         | Perilaku                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepare({batchId,batchKind,modelVersion,packageId?,cutoffAt})` | Membekukan input canonical graded sampai cutoff UTC; batchId menjadi identitas idempotensi.                                                  |
| `complete(output)`                                              | Memvalidasi, menyimpan item result dan digest secara atomik. Output identik boleh diulang; output berbeda pada batch selesai ditolak.        |
| `fail(batchId,failureCode)`                                     | Menyimpan kegagalan dengan kode aman; batch selesai tidak dapat diubah menjadi gagal. Batch gagal dapat diproses ulang dengan snapshot sama. |
| `readiness(batchId)`                                            | Mengembalikan `batchSucceeded`, `enoughData`, dan `releasePolicyOpen: true`. Ini bukan izin pelepasan hasil Tryout.                          |

Kontrak TypeScript ada di `irt-integration.contract.ts`; envelope `contractVersion: "1"` merupakan **ENGINEERING IMPLEMENTATION awaiting Data review**. BatchKind `DAILY` atau `TRYOUT`; TRYOUT memerlukan packageId tipe TRYOUT. Snapshot respons menyimpan respondentId pseudonim, attempt/item/package/version ID, assessmentType, scoringPolicyVersionId, finishedAt, dan correctness dari awardedPoints terhadap maxPoints. Hanya PG canonical GRADED dengan answer yang sudah dinilai masuk ekstraksi. Riwayat retry tetap berada dalam input; deduplikasi/pemilihan respons model adalah keputusan Data. Batas kecukupan output dihitung terhadap responden unik, bukan jumlah attempt.

Output memuat satu hasil per questionVersionId input, sampleSize, dataStatus `SUFFICIENT`/`NOT_ENOUGH_DATA`, difficultyB/discriminationA/guessingC nullable, dan scaleId nullable. Sample size tidak dapat melebihi jumlah responden unik snapshot. Parameter harus null ketika data belum cukup. Nilai numerik harus finite; batas parameter statistik tidak ditebak. Model harus menyesuaikan precision schema yang sudah ada.

`IRT_PSEUDONYM_KEY` disediakan operator hanya di server, berupa secret acak stabil minimal 32 byte. HMAC-SHA256 menghasilkan ID responden tanpa menyertakan internal user ID, nama, atau email. Koordinasikan rotasi secret dengan Data karena rotasi mengubah keterkaitan responden antarbatch. Snapshot tidak diekspos oleh API Admin.

**Migrasi:** `0004_flimsy_korg` menambah input_snapshot, output_digest, dan failure_code pada irt_batches. Field nullable menjaga batch lama dapat dibaca. Batch lama tanpa snapshot tidak dapat difinalisasi ulang melalui layanan baru.

Admin membaca parameter melalui endpoint lama; `GET /admin/irt/batches` menambah informasi status, waktu mulai/selesai, failureCode, dan waktu rilis tanpa respons mentah. Batch gagal/pending atau sample <30 tidak membuka parameter numerik.

**OPEN-12/18:** model, seleksi respons, skala nilai Tryout, scheduling dan failure/release policy belum disetujui. `complete` tidak mengisi resultReleasedAt dan tidak mengubah nilai/XP historis. UI/engine Tryout harus memakai gate rilis yang disepakati, bukan menganggap SUCCEEDED otomatis berarti hasil boleh dibuka.

## Handoff frontend dan QA

- Avicenna: generated Create/Update/AdminDrillPackage DTO tersedia untuk UI paket; frontend Admin tetap ownership Avicenna.
- Qurotul: konsumsi paket canonical, migrasi ID pertanyaan ke attemptItemId, scheduler IRT, dan gate release Tryout.
- Data: tinjau envelope, strategi deduplikasi, modelVersion/scaleId, serta parameter dan kebijakan insufficient/error.
- Ferdi: tombol lanjut level, video/form laporan, afiliasi dan pemisahan nilai/XP pada dashboard tersedia. Kontrak Tryout/PvP/leaderboard final belum tersedia; integrasi fitur tersebut tetap menunggu pemilik backend.
- Agregasi dashboard berikut masih dibutuhkan dari backend: best score, best stars, aktivitas terbaru, XP dan konteks kelas. UI tidak membuat nilai/aktivitas fiktif atau membaca Supabase Data API.
- Salim: verifikasi tiga peran, paket draft/invalid/unready, concurrent publication, pinned item, akses attempt orang lain, mapping video invalid, output IRT 29/30, gagal/retry, dan skor historis tetap. Tes fixture bukan bukti OAuth Google atau rilis sekolah.

Pengujian database harus memakai localhost dengan NODE_ENV=test; gunakan database uji khusus, migrasi canonical, lalu TEST_DATABASE_URL. Jangan menjalankan tes pada sandbox bersama atau staging real-user.
