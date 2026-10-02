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

**PROPOSED — rekonsiliasi implementasi, 2 Oktober 2026, menunggu review:** draf boleh belum lengkap. Publikasi membutuhkan tepat 10 versi unik SINGLE_CHOICE dari kompetensi subbab level, ancestry/keluarga/kompetensi READY, dan review versi soal tercatat. Publisher memakai decoder konten yang sama dengan engine Student: prototype ini menerima empat opsi A–D dan teks/kunci/pembahasan valid. Policy yang dapat dimainkan saat ini adalah `DRILL_PG_DEMO`, versi 1, berstatus PUBLISHED dengan `configuration.questionType = "SINGLE_CHOICE"`. Policy lain boleh disimpan dalam draf tetapi belum dapat diterbitkan. Bobot item PG bernilai 1. Ini batas kompatibilitas engine yang ada, bukan keputusan bahwa seluruh konten final wajib memiliki empat opsi atau memakai policy demo. Konfigurasi akademik final tetap OPEN.

Keluarga paket mempertahankan tipe, level, dan variantIndex. Revisi paket terbit menggunakan `POST` dengan family sama dan packageVersion baru. Update draf, publikasi, dan arsip dilindungi transaksi; kegagalan audit membatalkan mutasi. Publikasi berulang tidak membuat paket/versi baru, tetapi setiap request mutasi Admin yang berhasil tetap diaudit.

Pembacaan paket legacy mengikuti nullable schema untuk `variantIndex` dan `scoringPolicyVersionId`; generated types tidak menyatakan metadata yang belum ada sebagai nilai wajib non-null. Draf tanpa varian/policy ditolak saat publikasi. API pembuatan baru tetap memerlukan keduanya; penanganan paket lama yang belum lengkap dikoordinasikan dengan pemilik engine.

Paket berada di `assessment_packages`/`package_items` dan setelah integrasi PR #25 dikonsumsi engine Student canonical. Attempt tetap memin versi soal/policy. Tabel `drill_*` hanya dipertahankan untuk audit/kompatibilitas histori; tidak ada dual-write. Bukti integrasi dan jalur migrasi: [rekonsiliasi empat PR](../development/CORE_CONTENT_IRT_INTEGRATION_2026-10-02.md).

## Video dan laporan Student — #11

| Method/path                                          | Input/hasil                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET /students/me/drill-attempts/{attemptId}/videos` | `{items:[{mappingId,title,url,source}]}`; hanya hasil Drill milik Student, maksimal tiga mapping/video READY menurut urutan kurasi. |
| `POST /students/me/question-reports`                 | `{attemptItemId,category,details?}`; mengembalikan `{id}`.                                                                          |
| `POST /students/me/video-reports`                    | `{attemptId,mappingId,category,details?}`; mengembalikan `{id}`.                                                                    |

**PRD RULE:** video direkomendasikan ketika skor Drill <80; tanpa video hasil tetap tersedia. Laporan merujuk item/versi atau mapping sebenarnya. Student tidak mendapat daftar laporan atau notifikasi tindak lanjut pada MVP.

Rekomendasi mendukung pembacaan hasil canonical maupun hasil Drill kompatibilitas. Pertanyaan belum dinilai/Drill belum selesai tidak menghasilkan rekomendasi. Laporan video harus menunjuk salah satu rekomendasi yang valid untuk attempt milik pelapor.

Laporan soal mencari item canonical milik Student dan answer tersimpan, lalu mengisi FK `question_reports.attempt_answer_id`. Item tidak tersedia ditolak `404 REPORT_ITEM_NOT_FOUND`; answer belum tersimpan ditolak `409 REPORT_ANSWER_UNAVAILABLE`. ID `questionInstanceId` dari engine canonical adalah ID `attempt_items` yang dipakai form laporan. ID pertanyaan legacy yang tidak memiliki item canonical tidak diubah menjadi FK palsu. Kegagalan tampil dan dapat dicoba ulang. Admin membaca/menindaklanjuti laporan melalui API Reports yang sudah ada.

**ENGINEERING IMPLEMENTATION:** category adalah teks 1–80 karakter; details opsional maksimal 2.000 karakter. Ini batas input engineering, bukan daftar kategori produk final. Jangan memasukkan PII dalam laporan. Metadata video impor juga diperiksa terhadap aturan HTTPS editor sebelum diberikan kepada Student.

Kedua POST laporan menerima `clientRequestId` UUID opsional. Server memakai ID itu sebagai primary key laporan dan advisory transaction lock: actor, referensi soal/mapping, category, serta details yang sama mengembalikan ID tersimpan; penggunaan ID untuk actor/referensi/isi berbeda ditolak 409. Kepemilikan attempt video tetap diperiksa pada retry, termasuk ketika mapping yang sebelumnya valid sudah diarsipkan. Form mengirim ID yang sama untuk retry isi yang sama dan ID baru setelah isi diubah. Client lama tanpa ID tetap diterima, tetapi retry client lama belum idempotent. Tidak ada migrasi tambahan untuk mekanisme ini.

## Integrasi IRT — #9

`IrtModule` mengekspor `IrtIntegrationService` untuk orchestrator/worker Qurotul. Tidak ada endpoint publik untuk menyuntikkan statistik.

| Layanan                                                         | Perilaku                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepare({batchId,batchKind,modelVersion,packageId?,cutoffAt})` | Membekukan input canonical graded sampai cutoff UTC; batchId menjadi identitas idempotensi.                                                  |
| `complete(output)`                                              | Memvalidasi, menyimpan item result dan digest secara atomik. Output identik boleh diulang; output berbeda pada batch selesai ditolak.        |
| `fail(batchId,failureCode)`                                     | Menyimpan kegagalan dengan kode aman; batch selesai tidak dapat diubah menjadi gagal. Batch gagal dapat diproses ulang dengan snapshot sama. |
| `readiness(batchId)`                                            | Mengembalikan `batchSucceeded`, `enoughData`, dan `releasePolicyOpen: true`. Ini bukan izin pelepasan hasil Tryout.                          |

Kontrak TypeScript ada di `irt-integration.contract.ts`; envelope `contractVersion: "1"` merupakan **ENGINEERING IMPLEMENTATION awaiting Data review**. BatchKind `DAILY` atau `TRYOUT`; TRYOUT memerlukan packageId tipe TRYOUT. Snapshot respons menyimpan respondentId pseudonim, attempt/item/package/version ID, assessmentType, scoringPolicyVersionId, finishedAt, dan correctness dari awardedPoints terhadap maxPoints. Hanya PG canonical GRADED dengan answer yang sudah dinilai masuk ekstraksi. Riwayat retry tetap berada dalam input; deduplikasi/pemilihan respons model adalah keputusan Data. Batas kecukupan output dihitung terhadap responden unik, bukan jumlah attempt.

Output memuat satu hasil per questionVersionId input, sampleSize, dataStatus `SUFFICIENT`/`NOT_ENOUGH_DATA`, difficultyB/discriminationA/guessingC nullable, dan scaleId nullable. Sample size tidak dapat melebihi jumlah responden unik snapshot. Parameter harus null ketika data belum cukup. Nilai numerik harus finite dan dapat disimpan dalam `numeric(12,6)`; overflow setelah pembulatan ditolak sebelum mutation. Ini batas persistence, bukan batas statistik model.

`cutoffAt` harus ISO 8601 dengan timezone eksplisit. Respons hanya masuk snapshot ketika `finishedAt` dan `gradedAt` keduanya tidak melewati cutoff. Retry batch tetap memakai snapshot pertama, termasuk bila respons lain dinilai belakangan. Pembacaan Admin menyamarkan parameter berstatus `NOT_ENOUGH_DATA` walaupun sampleSize ≥30. Nilai status legacy lainnya tetap mengikuti gate lama sampleSize ≥30 dan batch SUCCEEDED, karena schema lama tidak menetapkan enum Data yang final. Query status/readiness/failure tidak memuat JSON snapshot yang besar.

`IRT_PSEUDONYM_KEY` disediakan operator hanya di server, berupa secret acak stabil minimal 32 byte. HMAC-SHA256 menghasilkan ID responden tanpa menyertakan internal user ID, nama, atau email. Koordinasikan rotasi secret dengan Data karena rotasi mengubah keterkaitan responden antarbatch. Snapshot tidak diekspos oleh API Admin.

**Migrasi gabungan:** `0009_irt_integration_metadata` menambah input_snapshot, output_digest, dan failure_code pada irt_batches dengan `IF NOT EXISTS`. Field nullable menjaga batch lama dapat dibaca. Batch lama tanpa snapshot tidak dapat difinalisasi ulang melalui layanan baru.

Migrasi fork `0004_flimsy_korg` dan `0005_irt_metadata_cursor_recovery` diarsipkan byte-for-byte dalam `packages/database/staging/fixtures/irt-branch`; keduanya tidak menjadi jurnal aktif alternatif. CLI `db:migrate` mengenali hash fork tersebut dan baseline 0003, lalu menerapkan migrasi Core Learning yang terlewat secara transaksional. Cursor tak dikenal yang akan melewati DDL ditolak sebelum mutasi. Riwayat/hash lama dan nilai metadata tidak ditimpa. Jalankan migrator sampai jurnal terbaru, lalu `pnpm db:check`; jangan menghapus atau menurunkan timestamp riwayat database. Backup dan rehearsal salinan database tetap diperlukan sebelum deployment shared/staging.

Admin membaca parameter melalui endpoint lama; `GET /admin/irt/batches` menambah informasi status, waktu mulai/selesai, failureCode, dan waktu rilis tanpa respons mentah. Batch gagal/pending atau sample <30 tidak membuka parameter numerik.

**OPEN-12/18:** model, seleksi respons, skala nilai Tryout, scheduling dan failure/release policy belum disetujui. `complete` tidak mengisi resultReleasedAt dan tidak mengubah nilai/XP historis. UI/engine Tryout harus memakai gate rilis yang disepakati, bukan menganggap SUCCEEDED otomatis berarti hasil boleh dibuka.

## Handoff frontend dan QA

- Avicenna: generated Create/Update/AdminDrillPackage DTO tersedia untuk UI paket; frontend Admin tetap ownership Avicenna.
- Qurotul: engine canonical dan referensi attemptItemId terintegrasi; scheduler IRT dan gate release Tryout final tetap dependensi.
- Data: tinjau envelope, strategi deduplikasi, modelVersion/scaleId, serta parameter dan kebijakan insufficient/error.
- Ferdi: tombol lanjut level, video/form laporan tersedia. Dashboard, Tryout, PvP dan leaderboard memakai kontrak PR #25; gate OPEN-07/11/12/18 tetap berlaku.
- Dashboard NestJS menyediakan skor terakhir/terbaik, aktivitas dan konteks kelas. XP final tetap OPEN-11; UI tidak membuat nilai/aktivitas fiktif atau membaca Supabase Data API.
- Salim: verifikasi tiga peran, paket draft/invalid/unready, concurrent publication, pinned item, akses attempt orang lain, mapping video invalid, output IRT 29/30, gagal/retry, dan skor historis tetap. Tes fixture bukan bukti OAuth Google atau rilis sekolah.

Pengujian database harus memakai localhost dengan NODE_ENV=test; gunakan database uji khusus, migrasi canonical, lalu TEST_DATABASE_URL. Jangan menjalankan tes pada sandbox bersama atau staging real-user.
