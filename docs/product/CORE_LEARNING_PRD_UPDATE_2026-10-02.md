# Pembaruan konteks Core Learning — 2 Oktober 2026

## Sumber dan batas kewenangan

Pengguna memberikan dua PRD fitur terbaru untuk menyelaraskan seluruh konteks engineering:

- [Drill / Latihan Soal v1.2](sources/PRD_01_Drill_Latihan_Soal.docx.md).
- [TryOut v1.1](sources/PRD_02_Core_Learning_TryOut.docx.md).

Salinan sumber di atas dipertahankan tanpa perubahan isi. Untuk Drill, Pretest yang dibahas dalam Drill, dan TryOut, PRD fitur terbaru mengungguli ringkasan PRD v0.5 bila berbeda. PRD v0.5 tetap menjadi baseline lintas fitur yang tidak diganti. ADR tetap menentukan arsitektur, bukan kebijakan produk. Dokumen desain dan kontrak implementasi tidak dapat menutup TBC di PRD.

**PRD RULE** adalah aturan eksplisit sumber terbaru; **OPEN** adalah TBC/dependency; **ENGINEERING DECISION** mengikuti keputusan teknis yang telah dicatat; **PROPOSED** belum disetujui. Label “Implementation Ready” pada sumber tidak berarti seluruh TBC sudah selesai atau runtime telah sesuai.

## Perubahan terhadap konteks sebelumnya

| Area          | Konteks sebelumnya                                                     | Konteks yang berlaku                                                                                                                                                            | Sumber                              |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Akses TryOut  | Memerlukan kelas; Mandiri menunggu pembayaran                          | Semua siswa, termasuk Mandiri, gratis pada MVP; tidak ada checkout                                                                                                              | TryOut §1–2, §16                    |
| Paket TryOut  | Jumlah/bentuk resmi seluruhnya OPEN; PG saja                           | 35 soal; PG, PGK MCMA, PGK Kategori wajib MVP. Rubrik PGK dan komposisi belum final                                                                                             | TryOut §1, §8, TRY-AC05–06          |
| Paket lampau  | Selalu dikunci ketika paket baru rilis                                 | Tetap terlihat; pernah dikerjakan tidak dapat diulang. Paket lampau belum pernah dikerjakan mengikuti policy yang masih TBC                                                     | TryOut §4, §10, §16                 |
| Jadwal        | Rilis Senin 00:00 WIB dan penutupan paket otomatis diasumsikan bersama | Rilis mingguan Senin tetap baseline v0.5; waktu akhir batch, durasi, dan hubungan deadline attempt dengan periode perlu dikunci                                                 | TryOut §5, §16; OPEN-05/18          |
| Hasil TryOut  | Target 3×24 jam, seluruh timing dianggap OPEN                          | Maksimal 3×24 jam setelah batch/periode berakhir adalah aturan produk. Jadwal batch dan penanganan gagal/terlambat tetap OPEN                                                   | TryOut §7–8, TRY-AC15/23            |
| Timer TryOut  | Deadline ada; finalisasi otomatis belum lengkap                        | Countdown tidak dapat pause; 0 melakukan auto-submit tanpa konfirmasi, satu finalisasi bersama submit manual                                                                    | TryOut §6, TRY-AC09–13              |
| XP TryOut     | Formula final OPEN                                                     | Berdasarkan skor saja, tanpa speed/bonus durasi; konversi angka tetap TBC. `XP = final score` hanya PROPOSED di sumber                                                          | TryOut §9, §16                      |
| Timer Drill   | Count-up dengan wording timeout ambigu                                 | Count-up informasional, tidak pause, tanpa deadline; durasi <15 menit eligible speed bonus, ≥15 menit tidak                                                                     | Drill §7–8, DRL-AC-06–07            |
| XP Drill      | Formula angka v0.5 sering disalin sebagai baseline implementasi        | Base XP, pemberian XP saat gagal, dan formula speed bonus TBC; formula lama tidak boleh dijadikan keputusan final                                                               | Drill §8, §18 OPEN-01–02            |
| Bintang       | Rentang 10–50 / 60–90 / 100, skor 0 OPEN                               | 1–3 bintang dari final score saja; seluruh threshold TBC; bintang bukan syarat unlock                                                                                           | Drill §8, §18 OPEN-03               |
| Retensi       | Akses pembahasan Drill 90 hari dianggap final                          | Periode retensi pembahasan/history kembali OPEN; jangan menetapkan 90 hari dari sumber lama sebagai aturan terbaru                                                              | Drill §12, §18 OPEN-07              |
| Pretest       | Maksimal 3 level saat sempurna dianggap pemetaan pasti                 | 20 soal/bab, sekali seumur hidup, opsional, tanpa XP; Skip membuka Level 1 semua subbab. Seluruh mapping score → level TBC                                                      | Drill §5, §18 OPEN-04               |
| Retry/progres | Varian berbeda dijanjikan tanpa fallback eksplisit                     | Retry level gagal maupun completed; varian setara berbeda jika tersedia, fallback OPEN. Best score tertinggi dari attempt valid; history terpisah; unlock tidak ditarik kembali | Drill §6, §8–9, §12                 |
| Sesi          | Refresh/resume dianggap jaminan PRD                                    | Save state dan warning refresh/exit wajib sesuai jaminan aktual. Media storage, expiry, resume/abandon tetap keputusan teknis/product yang perlu dikunci                        | Drill §7, §13, §18; TryOut §11, §16 |
| Konten/Admin  | CRUD/publikasi Admin menjadi bagian handoff fitur                      | Curriculum menyediakan bank/paket; CRUD Admin dan UI konfigurasi berada di luar scope kedua fitur. API Admin yang ada adalah kapabilitas operasional terpisah                   | Drill §2–3; TryOut §2               |

## Aturan Drill yang perlu dikonsumsi lintas tim

**PRD RULE:** Bab → Subbab → Level; progres antar subbab independen. Level locked tidak dapat dimulai. Satu attempt berisi 10 soal satu per tampilan, navigator, perubahan jawaban sebelum submit, konfirmasi final, dan jawaban terkunci sesudahnya. Score 0–100; ≥80 membuka level berikutnya; <80 menawarkan retry. Retry tidak menarik unlock atau menimpa history. Best score hanya naik bila hasil valid lebih tinggi.

Result menampilkan score, XP, bintang, ketuntasan/unlock, akses pembahasan setelah submit, dan retry. Nilai XP/bintang yang belum final harus menampilkan status pending; jangan memakai formula fiktif. Saat gagal, tampilkan maksimum tiga video YouTube relevan subbab dengan state kosong/error yang tidak menghalangi hasil. Laporan video merujuk video/subbab; laporan soal mencakup kategori soal/opsi/kunci/pembahasan dan referensi question, level, subbab, attempt/variant bila tersedia. Satu final submission tidak menghasilkan result, history, XP, atau kontribusi leaderboard ganda.

Pretest memiliki modal informasi Mulai/Skip, 20 soal dengan navigator, hasil/mapping unavailable, status completed tanpa reattempt, dan status skipped dengan Level 1 seluruh subbab. Arti one-time setelah Skip dan akses Pretest Mandiri perlu direkonsiliasi; PRD terbaru tidak secara eksplisit menetapkan perubahan batas afiliasi Pretest v0.5. Jangan menyamakan akses TryOut gratis dengan perubahan semua fitur berbasis kelas.

## Aturan TryOut yang perlu dikonsumsi lintas tim

**PRD RULE:** Listing Ongoing/Past → Detail → Tutorial/Rules → validasi server → attempt → manual submit dengan konfirmasi atau auto-submit pada 0 → Submission Success → Waiting/Processing → Result Released → nilai dan pembahasan. Paket sama untuk semua siswa pada batch/periode sama; satu attempt/user/paket, termasuk akses langsung URL, refresh, double-click, dan request ulang. Start hanya setelah attempt valid dibuat; paket expired/unavailable tidak dapat dimulai.

TryOut 35 soal mendukung ketiga format PG/PGK. Timer countdown tidak pause. Jawaban dapat diubah sebelum final dan terkunci setelah final; navigator tidak mengganti paket. Hasil dan pembahasan tersembunyi sampai release IRT. Maksimal 3×24 jam dihitung dari akhir batch/periode, bukan submit individual. Delay/error tetap menampilkan processing tanpa skor parsial; raw submission dipertahankan untuk retry backend. Nilai setelah release immutable, mengikuti skala TKA yang disetujui Research/Curriculum dan diberi label hasil simulasi. XP dari skor saja; formula TBC. TryOut tidak membuka level Drill (baseline lintas fitur v0.5).

## Keputusan terbuka dan penomoran

Gunakan [OPEN_DECISIONS](OPEN_DECISIONS.md). ID sumber Drill `OPEN-01`–`OPEN-10` ditulis **DRL-OPEN-01**–**DRL-OPEN-10** agar tidak tertukar dengan register global v0.5. Sumber TryOut §16 tidak memiliki ID TBC; alias **TRY-TBC-01**–**TRY-TBC-07** adalah indeks engineering, bukan nomor dari PRD.

Minimum 30 responden dan batch harian tetap baseline v0.5 untuk analisis/detail soal Admin. PRD TryOut terbaru tidak menetapkan angka kecukupan respons sebagai gate universal rilis siswa. Gate `sampleSize >= 30` pada kontrak saat ini adalah kondisi implementasi yang perlu direview Data/PO terhadap SLA 3×24 jam, bukan penyelesaian kebijakan low-response.

## Dampak implementasi dan dokumentasi

Pembaruan ini hanya menyelaraskan konteks. Kode, OpenAPI/generated types, JSON Schema, migrasi, runtime, dan `.env` tidak berubah. Kontrak yang masih PG saja, class-required, formula/rentang lama, batas 90 hari, atau belum auto-submit adalah **gap terhadap PRD terbaru**, bukan bukti acceptance baru. Riwayat audit bertanggal tetap berisi bukti pada tanggalnya dengan penanda supersession; jangan menulis ulang hasil tes historis.

| Kelompok dokumen           | Dampak                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Product/index              | Prioritas sumber, akses, rules, glossary, pemetaan modul dan OPEN                                            |
| Architecture/API           | Eligibility siswa, timer/finalisasi, lifecycle IRT, kontrak PGK yang perlu diperluas; batas actual vs target |
| Data                       | Pin konten/policy, best score/history, skala TryOut TBC, event terbaru, input/output IRT dan retensi         |
| Design                     | Inventory page/component/modal/state; tanpa payment/class lock TryOut; warning save/refresh; pending formula |
| Testing/operations/privacy | DRL-AC-01–24, TRY-AC01–25, data-loss/race/timeout, SLA, retensi OPEN                                         |
| Development/status/audit   | Backlog mengikuti requirement terbaru; trial pertama tetap Drill sesuai scope yang dicatat                   |

## Traceability acceptance

Seluruh **24 DRL-AC** dan **25 TRY-AC** tersedia pada sumber yang disalin. [QA Guide](../testing/QA_GUIDE.md) memetakan rentang ID ke skenario verifikasi; [Test Strategy](../testing/TEST_STRATEGY.md) menentukan lapisan tes. Tes formula XP, threshold bintang, placement, retensi, durasi/skala TryOut, dan policy paket lampau harus menunggu keputusan terkait atau memakai fixture berlabel DEMO. Pemeriksaan dokumen tidak menggantikan tes acceptance runtime.
