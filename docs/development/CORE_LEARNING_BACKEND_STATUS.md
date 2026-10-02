# Status backend Core Learning

Status working tree per 1 Oktober 2026. Dokumen ini mencatat implementasi dan bukti lokal; semua perubahan masih perlu review dan belum merupakan bukti kesiapan staging. Sumber aturan produk: [Product Context](../product/PRODUCT_CONTEXT.md), [Open Decisions](../product/OPEN_DECISIONS.md), dan [PRD Mapping](../product/PRD_MAPPING.md).

**PROPOSED — integrasi 2 Oktober 2026:** PR #25/#22/#23/#24 digabung pada branch integrasi untuk satu PR menuju main. Paket Admin, laporan Student dan snapshot IRT memakai engine canonical yang sama; jurnal gabungan menambahkan 0009 untuk metadata IRT. Review, bukti pengujian dan jalur upgrade ada pada [laporan integrasi](CORE_CONTENT_IRT_INTEGRATION_2026-10-02.md). Status merge aktual tetap mengikuti GitHub.

**ENGINEERING DECISION — perluasan integrasi 2 Oktober 2026:** atas instruksi pemilik, #26/#27/#28 ditambahkan ke PR #29. Token guru baru delapan karakter memakai HMAC berversi dengan pepper server; token lama tetap berlaku sampai kedaluwarsa. Kode kelas baru enam karakter tetap dapat dipakai beberapa siswa; hanya token guru yang single-use. UI responsif mempertahankan engine canonical, isolasi cache per identitas, histori/IRT, laporan/video, dan akses PvP/peringkat sesuai availability API. Detail dan gate validasi ada pada [rekonsiliasi onboarding dan UI](ONBOARDING_UI_INTEGRATION_2026-10-02.md). Ini belum menyatakan merge ke main atau kesiapan staging.

## Fondasi dan Drill

- [x] Runtime Drill memakai `assessment_packages`, `assessment_attempts`, `attempt_items`, dan `attempt_answers`. Service katalog, Drill, riwayat, dan Tryout dipisahkan.
- [x] Migrasi 0004 mempertahankan UUID, versi soal/kebijakan, jawaban, hasil, dan referensi progres legacy. Preflight menolak snapshot yang berbeda; rekonsiliasi menghitung baris legacy dan hasil salinan. Tabel legacy dipertahankan untuk audit migrasi.
- [x] Migrasi 0005 menyimpan `unlockedLevelId` historis pada attempt. Constraint melindungi satu Drill aktif per siswa/level dan kesesuaian package/level.
- [x] Sepuluh soal, start berulang, simpan/ubah/kosongkan jawaban, resume, retry paket berbeda, submit serentak, 80% mastery, bintang, kepemilikan attempt, dan progres Guru memiliki tes PostgreSQL.
- [x] Hasil memakai nilai yang tersimpan; versi soal tetap dipin. Kunci/pembahasan tersembunyi sebelum submit dan akses pembahasan Drill berakhir setelah 90 hari.
- [x] Riwayat siswa memakai cursor dan memisahkan hasil siap dari Tryout yang menunggu IRT. Maksimal tiga video READY direkomendasikan untuk hasil Drill di bawah 80%; daftar kosong tetap valid.
- [x] OpenAPI dan tipe frontend dihasilkan dari DTO backend.
- [ ] E2E browser di staging untuk Admin → Guru → Siswa → Drill → progres Guru, review kode, dan persetujuan Curriculum atas soal demo.

**PRD RULE:** Drill tanpa timeout tersembunyi, ambang mastery 80%, retry tanpa batas, dan akses pembahasan 90 hari. Struktur konten final tetap bergantung pada **OPEN-01/OPEN-10**.

## Job pendukung dan leaderboard

- [x] Worker memproses analytics outbox dari PostgreSQL dengan row lock, retry setelah kegagalan, dan insert idempotent berdasarkan `eventId`. Redis tidak menyimpan satu-satunya salinan event.
- [x] Proyeksi leaderboard kelas mengambil XP DRILL/TRYOUT dari ledger, diperbarui saat boot dan tiap jam, dan mempertahankan arsip periode. Periode mencakup Kamis 00:00 WIB hingga akhir Rabu; batas berikutnya Kamis 00:00 WIB. PvP memiliki tabel/jalur terpisah.
- [x] Tes worker meliputi pengiriman ulang event, peringkat seri, proyeksi berulang, batas WIB, dan arsip periode.
- [ ] Penulisan XP saat finalisasi, versi kebijakan XP, rekonsiliasi hasil/progres/XP, serta alert job gagal.

**OPEN-11:** formula XP final belum disetujui. Tidak ada XP otomatis yang diterbitkan oleh alur asesmen ini; proyeksi leaderboard baru fondasi dari ledger yang sudah tersedia. Penentuan peringkat seri pada proyeksi adalah **PROPOSED** untuk review produk sebelum rilis leaderboard.

## Tryout dan IRT

- [x] Infrastruktur PG untuk paket terbit: eligibility kelas, rilis Senin 00:00 WIB, satu attempt/paket, resume, save/clear, deadline dari paket, submit idempotent, dan outbox. Migrasi 0006 mencegah dua paket TRYOUT berstatus PUBLISHED pada waktu rilis yang sama.
- [x] Result dan riwayat menyembunyikan skor/kunci hingga batch SUCCEEDED yang dirilis mencakup seluruh versi soal dengan minimal 30 respons dan status SUFFICIENT.
- [x] Tes PostgreSQL memakai paket dan model berlabel fixture; tes batas waktu rilis memakai `Asia/Jakarta`.
- [ ] Publikasi paket resmi, finalisasi otomatis saat deadline, batch IRT harian, skor/model final, pesan data belum cukup, dan kebijakan keterlambatan/kegagalan batch.

**OPEN-05/OPEN-12/OPEN-18:** konfigurasi paket resmi, model statistik, dan perilaku rilis final menunggu keputusan pemilik produk/Data. Admin tetap menolak publikasi Tryout dengan `TRYOUT_POLICY_OPEN`. Penskoran MCMA/Category belum diaktifkan sesuai **OPEN-04**.

## Pretest

- [x] Schema asesmen umum mendukung PRETEST, pin versi soal/kebijakan, dan constraint maksimal satu attempt SUBMITTED/GRADED per siswa/bab. Riwayat mendukung record Pretest.
- [ ] Endpoint start/lewati/resume/submit, eligibility kelas, paket 20 soal, placement, dan pembaruan unlock yang mempertahankan progres lama.

**OPEN-01–03:** struktur final, distribusi soal, dan placement belum disetujui. Endpoint final tidak dibuat dengan aturan placement yang diasumsikan.

## Bukti dan gerbang rilis

Pengujian dijalankan pada PostgreSQL lokal terisolasi, bukan Supabase shared development/staging. Gunakan `NODE_ENV=test` dan `TEST_DATABASE_URL` untuk mengaktifkan integration suite. Migrasi diterapkan melalui CLI, bukan dashboard.

Perintah verifikasi utama:

```text
pnpm --filter @tka/database db:migrate
pnpm --filter @tka/database db:upgrade-check
pnpm --filter @tka/api test -- --no-file-parallelism --maxWorkers=1
pnpm --filter @tka/database test -- --no-file-parallelism --maxWorkers=1
pnpm --filter @tka/worker test -- --no-file-parallelism --maxWorkers=1
pnpm openapi:generate
pnpm contracts:types
```

QA staging, rollback aplikasi, observability/alert, dan penutupan keputusan OPEN belum selesai. Jangan menandai keseluruhan Core Learning sebagai siap rilis hanya dari tes lokal.

## Integrasi area siswa (1 Oktober 2026)

- [x] Dashboard berbasis API, layout desain prototipe pada seluruh area siswa, gate Student/QueryProvider bersama dan isolasi cache identitas.
- [x] UI PvP dan peringkat terhubung NestJS; route pratinjau dan simulator frontend dihapus, URL lama 404.
- [x] Engine PvP/gateway, pin versi, transaksi/outbox, timer/reconnect, undangan sekelas, Redis job/cache dan recovery cancellation. Akun nyata masih diblokir **OPEN-07**.
- [x] Endpoint leaderboard PvP top20/posisi sendiri dan kelas, best record/proyeksi per kesulitan, rekonsiliasi periode sebelum archive. Kelas masih policyPending **OPEN-11**, tanpa XP formula asumsi.
- [x] Migrasi 0007/0008 dan rehearsal backfill data PvP historis di database uji.

Bukti pengujian dan instruksi menjalankan migrasi: [Student Area Implementation](STUDENT_AREA_IMPLEMENTATION.md). Kontrak: [Student Area Contract](../api/STUDENT_AREA_CONTRACT.md). Status lokal ini belum menyatakan kesiapan staging/produksi.
