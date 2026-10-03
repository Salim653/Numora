# Rekonsiliasi PR #40 — operasional konten Admin

**ENGINEERING DECISION — implementasi yang diminta pengguna 3 Oktober 2026:** PR #40 direkonsiliasi ke main `cc23428`, termasuk QA monitoring #38 dan ownership #37. Controller learning mengikuti main sepenuhnya: metadata cursor optional dan levelId/filter history terbaru dipertahankan. Perubahan lama ApiQuery PR tidak diterapkan ulang; generated types/OpenAPI tidak diganti dengan hasil lama.

UI memakai endpoint canonical existing untuk buat/edit/publish/archive paket Drill; metadata review/audit; laporan/filter/tindak lanjut; dan status batch IRT yang dipisahkan dari status release. Admin nonaktif ditolak consumer sebelum load; AdminGuard existing tetap otoritatif. Filter laporan hanya halaman yang dimuat dan konteks versi soal yang belum ada di API tidak ditebak.

PR tidak menetapkan policy XP, star, retention, model IRT atau tryout release baru; tidak memodifikasi hasil historis atau menambah migration. Admin CRUD tetap kemampuan operasional di luar acceptance fitur siswa.

Tes tambahan memeriksa create/update pinned versions, failed edit/retry tanpa false Saved, archive confirmation dan disabled Admin. Browser fixture menjalankan create/edit/publish/archive → resolve laporan → IRT SUCCEEDED tanpa release pada mobile/desktop. Endpoint/body yang dipakai diverifikasi; pengujian backend canonical tetap berada pada suite existing/CI. Evidence fixture tidak membuktikan login Google/staging atau approval Curriculum.

CI [37101177953](https://github.com/ayiinee/Numora/actions/runs/37101177953) pada head `88a1325` lulus seluruh gate termasuk PostgreSQL/Redis, browser, upgrade/bridge, connected release chain, build dan OpenAPI freshness. [PR #40](https://github.com/ayiinee/Numora/pull/40) merged pada 3 Oktober 2026, commit `36b0f25`, melalui jalur maintainer ayiinee dengan bypass review yang terkonfigurasi, setelah quality dan CodeRabbit SUCCESS. Ini bukan approval reviewer independen atau QA staging.

Lokal: 14 tes content UI, 2 tes browser lifecycle pada 390/1440 px, lint, typecheck web/workspace dependencies, build workspace, validasi schema/shared types lulus. OpenAPI diregenerasi secara berurutan setelah build dan identik dengan main. Tab aktif memakai variant secondary dan selector lebih spesifik agar warna hover tetap terbaca. Screenshot fixture tersedia pada [evidence/pr40-2026-10-03](evidence/pr40-2026-10-03/README.md).
