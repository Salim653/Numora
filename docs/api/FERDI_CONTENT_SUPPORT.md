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

Pembacaan paket legacy mengikuti nullable schema untuk `variantIndex` dan `scoringPolicyVersionId`; generated types tidak menyatakan metadata yang belum ada sebagai nilai wajib non-null. Draf tanpa varian/policy ditolak saat publikasi. API pembuatan baru tetap memerlukan keduanya; penanganan paket lama yang belum lengkap dikoordinasikan dengan pemilik engine.

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

