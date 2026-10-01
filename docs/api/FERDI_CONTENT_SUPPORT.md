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

