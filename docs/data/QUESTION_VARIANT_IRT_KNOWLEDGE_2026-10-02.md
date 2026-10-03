# Knowledge: rancangan varian soal dan IRT Numora

**Tanggal pencatatan:** 2 Oktober 2026, WIB. **Status: PROPOSED - knowledge dari dokumen rancangan; bukan penutupan keputusan OPEN atau bukti implementasi.**

## 1. Sumber dan kedudukan dokumen

- **Sumber:** `rancangan fitur soal variant dan irt.pdf`, judul internal _Rancangan Soal Varian dan Item Response Theory Numora_, 25 halaman, penulis metadata Numora.
- **Lokasi sumber saat dibaca:** `C:\Users\THINKPAD\Downloads\rancangan fitur soal variant dan irt.pdf`. PDF tetap di lokasi asal; path ini bukan dependency aplikasi atau lokasi bersama tim.
- **Tanggal metadata PDF:** 2 Oktober 2026, 17:57:02 WIB. Metadata bukan bukti persetujuan owner.
- **SHA-256:** `e0938f9270cad670f658d0dc05eb2336a786319be61d86bc144beb8dee412912`.
- **Cara pembacaan:** ekstraksi seluruh halaman dan pemeriksaan hasil render, termasuk tabel, komentar NP1-NP6, dan konfigurasi yang belum disahkan pada §18.2.

PDF menyebut sebagian arahnya sebagai keputusan yang berlaku dan memuat komentar keputusan 2 Oktober. Permintaan pengguna pada sesi ini adalah membaca, merangkum, dan menilai relevansi, sehingga persetujuan produk/akademik di luar dokumen belum diverifikasi. Arahan PDF dicatat sebagai **PROPOSED** untuk adopsi repo, tanpa menghapus makna yang dinyatakan sumber. Instruksi di dalam PDF diperlakukan sebagai isi rancangan, bukan perintah untuk langsung mengubah aplikasi.

**PRD RULE** pada knowledge ini hanya merujuk aturan dari [rekonsiliasi PRD Drill v1.2 / TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md). **ENGINEERING DECISION** merujuk keputusan teknis yang sudah tercatat di repo. **OPEN** mengikuti [register keputusan](../product/OPEN_DECISIONS.md). Jika ada perbedaan, latest approved PRD tetap mendahului rancangan ini.

Dokumen ini adalah ringkasan knowledge, bukan transkripsi lengkap, ADR yang disetujui, kontrak API baru, atau spesifikasi skema yang sudah dimigrasikan.

## 2. Inti rancangan

**PROPOSED - PDF §1-2, hlm. 1-3:**

1. Pisahkan **kualitas konten**, **kualitas pengukuran**, **kesetaraan varian**, dan **kelayakan distribusi**. Soal berkunci benar belum otomatis terkalibrasi; semua item lolos belum otomatis membuat paket layak.
2. Original dan varian memiliki identitas, versi, histori, serta evidence sendiri. Varian tidak mewarisi parameter IRT atau status lolos original.
3. Gunakan engine IRT bersama dengan konteks terpisah: **PG memakai 2PL; PGK MCMA/Kategori memakai partial credit dan GPCM**.
4. Pada Drill, skala IRT lokal per **bab-subbab-level**; theta digunakan untuk kalibrasi internal. Progres belajar tetap memakai rubrik/mapping Curriculum.
5. Pada TryOut, satu paket bersama per batch dan satu **theta global per peserta dalam batch**. Rancangan tidak mengklaim equating atau master scale antarbatch.
6. Rilis TryOut memakai satu mode penilaian utama untuk seluruh batch: IRT jika layak atau fallback jika tidak. Hasil/pembahasan tidak tertahan tanpa batas.
7. Seluruh kebijakan, input, dan output harus berversi; pembaruan tidak menulis ulang skor/XP historis.

| Aspek                   | Drill / Practice dalam PDF                    | TryOut dalam PDF                                             |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| Tujuan IRT              | Validasi original-varian dan stabilitas soal  | Evaluasi latihan dan ranking dalam batch                     |
| Data utama              | Pilot original, kemudian trial A/B bersih     | Respons operasional satu paket bersama                       |
| Skala                   | Lokal bab-subbab-level, independen antarlevel | Lokal satu batch, global terhadap paket itu                  |
| Theta                   | Internal trial, bukan profil bab longitudinal | `theta_tryout` dari respons batch sendiri                    |
| Referensi               | Reference set lokal setelah gate pilot        | Tidak memerlukan bank anchor/master scale pada MVP rancangan |
| Produk saat data kurang | Nilai/mastery rubrik; trial dapat ditahan     | Fallback batch pada tenggat setelah policy disahkan          |

Parameter Drill tidak dipindahkan sebagai parameter TryOut, dan histori theta Drill tidak menjadi prior personal skor TryOut. Dua pola jawaban identik dalam konteks batch yang sama mendapat hasil identik menurut rancangan.

## 3. Jawaban, rubrik, dan model pengukuran

**PROPOSED - PDF §3, hlm. 3-4:** scoring mengubah jawaban mentah menjadi poin/kategori sesuai rubrik; IRT mengolah evidence tersebut; policy produk mengubah output yang layak menjadi hasil/analitik. Ketiga lapisan ini dipisahkan.

| Format       | Input IRT menurut PDF                              | Parameter                                | Ketergantungan                                                                   |
| ------------ | -------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| PG           | Salah/kosong yang disajikan: 0; benar: 1           | 2PL: discrimination `a`, difficulty `b`  | Kunci dan scoring policy versi soal                                              |
| PGK MCMA     | Kategori ordinal `0..K` dari rubrik partial credit | GPCM: `a` dan parameter langkah kategori | Penalti pilihan salah, select-all, jawaban kosong/tidak lengkap harus diputuskan |
| PGK Kategori | Kategori ordinal `0..K` dari rubrik partial credit | GPCM: `a` dan parameter langkah kategori | Poin per pernyataan/kategori dan aturan benar penuh harus diputuskan             |

Satu soal PGK adalah **satu unit psikometrik**; opsi/pernyataan dengan stimulus bersama tidak otomatis diperlakukan sebagai item biner independen. Contoh skor maksimum 3 dengan kategori 0,1,2,3 dalam PDF hanya ilustrasi, bukan rubrik MCMA yang disahkan. Urutan kategori tidak berarti jarak kemampuan antarkategori sama. Pemakaian mixed 2PL/GPCM harus lolos asumsi dimensi dan kualitas data.

2PL tidak mengestimasi guessing. Jika arah model ini disetujui, field guessing pada Admin perlu menyatakan tidak tersedia; angka default tidak boleh disajikan sebagai estimasi empiris. Ini perlu direkonsiliasi dengan [baseline output IRT](IRT_INTEGRATION.md), bukan langsung menghapus kontrak lama.

Data respons yang diarahkan sumber: `raw_answer`, `item_score`, `maximum_score`, `fully_correct`, dan `scoring_policy_version`. Bedakan:

- **Disajikan tetapi kosong:** mengikuti rubrik omission.
- **Tidak pernah disajikan:** missing by design, bukan otomatis salah.
- **Respons invalid/sesi gagal:** ditandai tersendiri, bukan dipaksa menjadi jawaban salah.

Perubahan isi, kunci, rubrik, atau kategori skor membuat versi baru dan membutuhkan evaluasi ulang. Raw answer tetap disimpan. PGK yang rubriknya belum disahkan diblokir dari publikasi final; kesiapan PG tidak menyatakan paket tiga format sudah memenuhi MVP.

**OPEN:** PDF belum memberi rumus MCMA/Kategori, penalti, bobot, pembulatan, atau aturan lengkap jawaban parsial. OPEN-04 / TRY-TBC-02 tetap terbuka. Nilai rubrik ternormalisasi 0-100 dalam sumber berbeda dari mapping skor IRT/TKA final.

## 4. Original, varian, generator, dan status

**PROPOSED - PDF §4-5, hlm. 4-6:**

- Original mempunyai `original_question_id`, `family_id`, dan versi konten tetap setelah digunakan. Varian mempunyai ID/versi sendiri serta `parent_question_version_id` yang menunjuk versi original tepat.
- Parameter dikunci pada versi item, rubrik, ekosistem, skala/batch, dan versi kalibrasi. Pencarian hanya berdasarkan `question_id` tidak cukup.
- Stok dibuat dalam **satu generation wave awal**. Kandidat gagal boleh diregenerate dalam wave itu; wave tambahan stok bukan scope MVP sumber.
- Simpan template/config version, seed, parameter aktual, iteration/replacement, dan payload konkret berikut kunci/pembahasan. Seed saja tidak cukup untuk menjamin reproduksi setelah generator berubah.
- Generator hanya mengubah bagian yang diizinkan Curriculum tanpa mengubah kompetensi, bentuk, struktur solusi, rubrik, atau target kesulitan keluarga/level.
- Validator memeriksa solusi/kunci, opsi unik, domain dan satuan, stimulus, duplikasi, serta pembahasan yang cocok dengan angka varian. Mengurutkan ulang opsi atau mengganti ID tidak membuat soal substantif baru.
- Template deterministik tervalidasi dapat mengikuti gate otomatis setelah konfigurasi disahkan. Keluaran AI bebas/ambigu atau tidak dapat diverifikasi perlu review manual.

| Lapisan status | Nilai dalam sumber                                                                              | Makna                                              |
| -------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Konten         | `DRAFT`, `CONTENT_VALID`, `REVIEW`, `QUARANTINED`, `ARCHIVED`                                   | Validitas akademik/kunci/penjelasan                |
| Pengukuran     | `UNCALIBRATED`, `INSUFFICIENT`, `CALIBRATION_FAILED`, `CALIBRATED`, `WATCH`, `DRIFT`, `ANOMALY` | Kualitas estimasi untuk konteks tertentu           |
| Kesetaraan     | `PENDING`, `INSUFFICIENT`, `PASS`, `DRIFT`, `NOT_COMPARABLE`, `ANOMALY`                         | Perbandingan original-varian pada acuan kompatibel |
| Distribusi     | `PROVISIONAL`, `READY`, `HOLD`, `RETIRED`                                                       | Kelayakan penggunaan untuk tujuan/konteks tertentu |

Status di atas adalah vocabulary rancangan, bukan enum baru yang sudah diterapkan. `PROVISIONAL` tidak sama dengan siap produksi. Pada TryOut, `TRYOUT_QUALITY_PASS` menunjukkan kualitas pada batch sendiri, bukan bukti kesetaraan lintas batch.

## 5. Pilot Drill, exposure, dan trial A/B

**PROPOSED - PDF §6-8 dan §11, hlm. 6-12, 14-15:**

1. Validasi original dan siapkan desain pilot/cohort, termasuk calon peserta fase kedua yang belum terpapar. Pilot pertama hanya mengumpulkan respons original.
2. Kalibrasi original pada skala bab-subbab-level yang terhubung. Original focal dan seluruh referensi yang diperlukan harus lolos gate; tidak harus menunggu seluruh bank original selesai.
3. Bekukan baseline original dan reference set beserta parameter, uncertainty, dan calibration version.
4. Baru buka trial kandidat. Peserta eligible diacak 1:1 ke A/B dalam kelas/periode; assignment disimpan sehingga refresh/resume tidak mengubah arm. A menerima referensi + original, B referensi yang sama + kandidat.
5. Estimasikan kembali original kontrol di fase kedua dengan referensi aktif tetap. Periksa kestabilan original/referensi, coverage, dropout, fit, dan uncertainty sebelum Compare.
6. Kandidat yang lolos semua gate item melanjutkan gate paket; drift yang cukup evidence dapat memicu adjustment terbatas dan trial versi pengganti dengan peserta eligible baru.

Contoh 9 referensi + 1 focal dalam paket 10 soal adalah ilustrasi, bukan jumlah referensi minimum yang disahkan. Banyak peserta mengerjakan **versi kandidat yang sama**, bukan seed baru per siswa. Lolos satu seed tidak membuktikan semua keluaran generator setara.

Exposure dicatat per item, keluarga, dan pembahasan lintas Drill, Pretest, PvP, TryOut, serta trial. Paparan focal **atau salah satu keluarga referensi** sebelum assignment mengeluarkan respons dari evidence bersih trial terkait. Peserta pilot masih bisa eligible untuk keluarga lain yang belum dilihat. Waktu berlalu, ID baru, atau opsi diacak tidak menghapus paparan. Paparan di luar platform adalah batas observabilitas yang perlu dinyatakan.

Repeat/duplicate/cancelled/invalid tidak menambah responden unik eligible. Jawaban salah yang eligible tetap evidence; exclusion tidak boleh didasarkan pada benar/salah. Raw evidence dan alasan exclusion tidak dihapus. Riwayat Drill reguler atau respons Pretest/PvP tidak otomatis dipool ke kalibrasi trial.

Trial diberi label khusus dan **tidak mengubah XP, bintang, mastery, atau unlock**. Pembahasan trial dirilis setelah collection ditutup. Theta internal bila disimpan membawa experiment/scale/model version dan uncertainty; sumber tidak mengusulkan profil theta bab atau averaging theta antarlevel.

## 6. Quality gate, Compare, dan adjustment

**PROPOSED - PDF §7-9, hlm. 9-13:** minimum **30 responden unik eligible per item versi** hanya memulai analisis. Bukan jaminan `CALIBRATED`/`PASS`, bukan jumlah attempt berulang, dan bukan universal gate rilis Student.

Gate memeriksa convergence, identifikasi skala/graf item bersama, precision/uncertainty, coverage kemampuan, variasi respons dan frekuensi kategori, model fit, local dependence, serta kestabilan acuan. Kategori GPCM kosong tidak digabung dengan asumsi baru tanpa revisi scoring policy. Nilai teknis awal seperti `a=1`, `b=0` tidak dicatat sebagai hasil empiris.

| Keputusan Compare | Kondisi dalam sumber                                                    | Tindakan                                                       |
| ----------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `PASS`            | Acuan stabil, evidence cukup, gap/kurva dan uncertainty memenuhi policy | Lanjut gate produksi item dan paket                            |
| `DRIFT`           | Gap material pada konteks kompatibel dan acuan stabil                   | Adjust dalam ruang config yang disahkan, regenerate versi baru |
| `INSUFFICIENT`    | Sampel, precision, atau coverage belum cukup                            | Tambah evidence; jangan adjust dari noise                      |
| `NOT_COMPARABLE`  | Skala/rubrik/format/referensi tidak kompatibel                          | Tahan klaim kesetaraan dan perbandingan parameter              |
| `ANOMALY`         | Salah kunci, ambigu, data/fit tidak wajar                               | Quarantine/review; hentikan otomasi terkait                    |

PG dibandingkan melalui `a`, `b`, dan kurva respons pada rentang theta sasaran. GPCM melalui discrimination, langkah kategori, dan kurva expected score ternormalisasi. Discriminative Index/analisis distractor adalah QA pendamping; tidak menggantikan model, uncertainty, atau stabilitas acuan. Confidence interval lebar tidak menjadi PASS hanya karena estimasi titik dekat.

Drift original/referensi menahan Compare dan auto-adjust. Original salah bukan target yang harus ditiru generator. Revisi original membentuk versi, dataset eligible, dan baseline baru. Baseline lama tetap terikat eksperimen lama.

Adjuster MVP sumber bersifat rule-based, membuat config/seed/versi kandidat baru, dan menyimpan evidence kandidat gagal. Semua loop mempunyai stop reason: PASS, insufficient, incompatible scale, anomaly, atau batas konfigurasi. **Lima regenerate maksimum** dan **perubahan 10-20%** adalah rekomendasi/contoh, bukan angka produksi yang sudah disahkan.

## 7. Paket dan distribusi

**PROPOSED - PDF §10, hlm. 13-14:** paket dan urutan/aturan penyajian dibekukan sebelum penggunaan; refresh/resume mempertahankan snapshot attempt. Item di-quarantine saat sesi berjalan tidak diganti diam-diam; perlu incident policy.

Drill reguler menggunakan 10 item tersimpan sesuai bab-subbab-level/blueprint. Cold start dapat memakai original tervalidasi dengan nilai rubrik. Varian produksi harus lolos gate item dan paket. Gate paket juga menilai coverage, composition, score categories, exposure, expected score/pass probability pada batas mastery, dan local dependence.

Stok mengutamakan varian belum dilihat. Sumber mengusulkan rotasi stok lama yang berbeda dari attempt terakhir dengan penanda exposure ulang; jika tidak dapat memberi perubahan paket, attempt ditahan. Tidak ada generate mendadak pada request Student. **OPEN:** opsi fallback ini belum menutup DRL-OPEN-09.

TryOut mengikuti baseline rilis Senin 00.00 WIB, satu daftar item bersama per batch, tanpa A/B paket atau personalisasi berbasis theta. Assembler menghindari keluarga dekat dalam satu paket dan menilai exposure pembahasan lintas modul. Jika konten/blueprint/stok/exposure tidak layak, sumber mengusulkan `NO_READY_PACKAGE` dan tindakan Product/Curriculum, bukan silent reuse paket lama. Horizon stok dan reuse perlu disahkan tersendiri.

**PRD RULE:** TryOut v1.1 menetapkan **35 soal, PG/PGK MCMA/PGK Kategori, gratis untuk Mandiri dan Sekolah, satu attempt per pengguna/paket**. Angka 35 dan akses gratis berasal dari PRD repo; PDF bukan sumber yang menetapkan ulang angka/akses ini.

## 8. Pipeline TryOut, fallback, dan histori

**PROPOSED - PDF §7.3, §12-13 dan §15, hlm. 10, 15-20:**

1. Sebelum rilis: validasi paket; pin versi item/rubrik, score mapping, dan konfigurasi batch.
2. Saat periode berjalan: simpan raw response, skor item internal sesuai policy, exposure, dan timestamp server; tidak tampilkan hasil akademik sebelum release.
3. Setelah akhir periode: tutup batch, finalisasi sesi menurut cutoff, dan bekukan `response_snapshot_id`.
4. Jalankan quality check dan kalibrasi mixed format pada skala lokal batch. Filter exposure menentukan subset kalibrasi, **bukan paket berbeda per siswa**.
5. Jika valid, gunakan item berkontribusi yang sama untuk seluruh attempt valid dan hitung theta/skor IRT. Jika tidak layak sampai tenggat, pilih fallback untuk seluruh batch; tidak mencampur mode utama antarsiswa.
6. Publikasikan hasil, ranking batch, dan semua pembahasan secara atomik; retry memakai snapshot/model/policy yang sama dan idempotency key.

**PRD RULE:** hasil dan pembahasan tersedia paling lambat **3×24 jam setelah akhir batch/periode**, skor/kunci/pembahasan tersembunyi sebelum release, dan skor released immutable. Waktu akhir batch dan failure/low-response policy masih OPEN.

PDF mengarahkan skor utama IRT sebagai transformasi monotonic theta dengan `score_mapping_version` approved. Tampilan 0-100 hanya opsi Product, **bukan persentase benar atau skala TKA final yang sudah ditetapkan**. Percentile batch disimpan terpisah. Ranking memakai resolusi/tie rule approved; sumber mengusulkan peringkat sama untuk skor sama dan tanpa tie-break kecepatan. Respons ekstrem tidak menampilkan infinity.

Fallback menggunakan nilai rubrik dan ranking batch, diberi label/alasan IRT tidak tersedia; bukan theta atau parameter sintetis. Jika item gagal gate IRT tetapi kontennya valid, exclusion dari perhitungan berlaku konsisten seluruh peserta; jika coverage/informasi tersisa tidak memadai, fallback seluruh batch.

Item salah kunci/konten tidak boleh tetap memberi poin fallback. Koreksi sebelum publish harus tercatat dan berlaku seluruh respons; item tak dapat diperbaiki dikeluarkan dan penyebut disesuaikan. Jika tidak ada item dapat dinilai, sumber mengusulkan hasil **batch tidak dapat diberi skor**, dengan alasan/errata dan tanpa skor/ranking palsu. Kebijakan ini perlu approval, bukan sekadar dibuat cabang otomatis oleh engineer.

Sesudah fallback released, kalibrasi terlambat boleh menjadi analitik berversi terpisah; tidak mengganti nilai utama/XP. Koreksi setelah publish memerlukan errata serta policy revisi administratif. Grafik tren menandai mode, batch, cohort, coverage, percentile/raw score; tidak menyebut selisih skor lintas batch sebagai kenaikan theta absolut. Rancangan tidak memerlukan anchor bank/linking antarbatch untuk MVP; menambah equating berarti perubahan scope.

Scheduling sumber memisahkan audit ingestion harian, checkpoint pilot/A/B Drill, dan kalibrasi TryOut setelah batch close. Ini arah rekonsiliasi cron, bukan persetujuan bahwa kebutuhan daily Admin analysis sudah otomatis dipenuhi.

## 9. Kontrak konseptual dan pembagian komponen

**PROPOSED - PDF §14, hlm. 18-19:** nama field boleh disesuaikan Software, tetapi keterikatan konteks/version harus dipertahankan.

| Kelompok         | Metadata penting                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Item/version     | ID item/versi/family/parent versi, taxonomy, tipe, konten/kunci/pembahasan, content status                                                               |
| Generation       | Wave, template/config/seed, parameter konkret, iteration/replacement, actor/waktu                                                                        |
| Paket/attempt    | Package version/type, ecosystem, scale/batch, daftar versi item/policy, user, server time, session status, unique attempt key                            |
| Respons/exposure | Raw answer, item/max score, fully correct, omission/missing, paparan item/family/pembahasan, eligibility snapshot, exclusion reason/policy               |
| Kalibrasi        | Versi item/rubrik/konteks, model/params/uncertainty, unique eligible count, kategori/fit/status, response snapshot/calibration version                   |
| Trial/Compare    | Experiment/phase/assignment/arm/cohort/period, source original calibration, baseline/reference/config/tolerance version, evidence/adjustment/stop reason |
| Hasil TryOut     | Theta, contributing items, estimator/score mapping/mode/finalization version                                                                             |
| Audit/publikasi  | Job/idempotency key, status/error/deadline, actor/waktu, publication version/correction reference                                                        |
| Gate paket       | Blueprint/item versions, expected score/pass probability, method/tolerance version, distribution status/promotion reason                                 |

Generator/config store, content validator, package assembler, response/scoring store, calibration service, evaluator/adjuster, result publisher, dan trial assignment service mempunyai tanggung jawab terpisah. Daftar ini tidak mengharuskan delapan microservice baru.

**ENGINEERING DECISION - repo:** NestJS tetap authoritative, PostgreSQL menyimpan fakta durable, dan Redis hanya queue/cache/ephemeral. Kontrak import pada [Question Contract](QUESTION_CONTRACT.md) berbeda dari Student API. [OpenAPI/generated types](../api/CORE_LEARNING_FRONTEND_CONTRACT.md) tetap jalur kontrak frontend; PDF tidak menjadi alasan membuat response type duplikat.

**PROPOSED - PDF §17, hlm. 22:** ML bukan prasyarat MVP. Mulai rule-based; ML dapat dimulai shadow recommendation setelah histori cukup, lalu otomasi tervalidasi. Evaluasi split family/template/waktu mencegah leakage. Prediksi tidak menggantikan gate konten atau trial nyata; parameter dari skala independen tidak dipool sebagai target difficulty universal.

## 10. Konfigurasi yang masih harus disahkan

PDF §18.2, hlm. 24 secara eksplisit meminta pengesahan konfigurasi. Tabel ini memetakan permintaan sumber ke register repo; tidak menutup ID tersebut.

| Status   | Keputusan                                                                     | Owner menurut sumber / repo                                | Dampak sebelum tersedia                                              |
| -------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------- |
| **OPEN** | Rubrik PGK, penalti MCMA, kategori/bobot/kosong/benar penuh dan dampak produk | Research/Curriculum + Product                              | OPEN-04, TRY-TBC-02; blokir final scoring/publish PGK                |
| **OPEN** | Skala/mapping IRT, transformasi, pembulatan, tie dan respons ekstrem          | Product + Data, Research/Curriculum untuk skala TKA        | OPEN-05/12, TRY-TBC-02/07; jangan memakai contoh 0-100 sebagai final |
| **OPEN** | Precision/fit/invariance/sample/category/curve tolerance                      | Data + Curriculum                                          | Auto-promosi/Compare final belum aktif                               |
| **OPEN** | Pilot/cohort/reference graph/baseline gate dan checkpoint                     | Data + Curriculum + Product                                | A/B kandidat tertahan sampai acuan layak                             |
| **OPEN** | Constraint generator, validator, max regenerate, retire                       | Curriculum + Data                                          | Auto-publish tidak aktif tanpa gate/config sah                       |
| **OPEN** | Durasi, komposisi/coverage dan stok TryOut                                    | Research/Curriculum + Product                              | TRY-TBC-01/02; 35 soal sudah FINAL dari PRD, bukan OPEN ulang        |
| **OPEN** | Batch end, sesi lintas tenggat, delayed upload, correction incident           | Product + Software + Data; Curriculum untuk relasi periode | TRY-TBC-06/07, OPEN-18; final cutoff/scheduler tidak ditebak         |
| **OPEN** | Disclosure trial dan gate paket/expected score/mastery tolerance              | Product + Curriculum + Data + Software                     | Trial tanpa progres; promosi paket menunggu policy                   |
| **OPEN** | Past never-attempted                                                          | Product                                                    | TRY-TBC-05; **tidak dijawab PDF**                                    |
| **OPEN** | Konversi score ke XP                                                          | Product + Data                                             | OPEN-11, TRY-TBC-03; **tidak diberi rumus PDF**                      |

Owner mencatat nilai, approval, tanggal berlaku, serta policy version. Software dapat membangun persistence/validation generik dan fixture **DEMO/TEST** tanpa mengarang konfigurasi produksi.

## 11. Perbedaan yang perlu direkonsiliasi

| Isi sumber                                          | Acuan repo terbaru                                                     | Perlakuan knowledge                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Retensi pembahasan Drill 90 hari, §6.2/§15          | DRL-OPEN-07: retensi kembali OPEN                                      | Catat sebagai rujukan lama; jangan aktifkan expiry 90 hari dari PDF                          |
| Pretest perfect maksimal tiga level, §11.3          | DRL-OPEN-04 / OPEN-03: seluruh mapping placement TBC                   | Jangan mengesahkan cap/mapping dari PDF                                                      |
| Rotasi stok lama atau tahan attempt, §10.1          | DRL-OPEN-09: fallback varian habis OPEN                                | Kandidat jawaban policy, perlu owner approval                                                |
| PG 2PL tanpa guessing; PGK GPCM                     | OPEN-12 dan metadata baseline Admin di IRT integration                 | Model lebih konkret, tetapi approval Data/kontrak tetap diperlukan                           |
| Fallback rubrik satu batch pada tenggat             | PRD mensyaratkan initial IRT-weighted score; failure/low-response OPEN | Kandidat policy kegagalan, bukan pengganti unconditional requirement IRT                     |
| Opsi tampilan skor 0-100; batch-local ranking/trend | PRD meminta skala TKA approved, angka masih TBC                        | Tidak mengklaim official scale atau comparability antarbatch                                 |
| Cron harian menjadi audit/checkpoint                | Baseline daily Admin item analysis                                     | Rekonsiliasi scheduler dan output Admin dengan Data; jangan diam-diam mengurangi requirement |

Gate runtime terdokumentasi saat ini masih PG-only, released batch `SUCCEEDED` dan semua item `SUFFICIENT` dengan ≥30. PDF mengusulkan gate kualitas, batch-wide fallback dan item exclusion yang lebih luas. Perubahan tersebut pekerjaan implementasi setelah keputusan, bukan kemampuan runtime yang sudah tersedia. Acuan status: [Core Learning Backend Status](../development/CORE_LEARNING_BACKEND_STATUS.md#tryout-dan-irt), [IRT Integration](IRT_INTEGRATION.md).

## 12. Apakah menjawab tahap berikutnya JOB-07?

**Sebagian, belum cukup untuk menyelesaikan JOB-07 penuh.** Berdasarkan [joblist terbaru](../development/MVP_JOBLIST_2026-10-02.md#job-07--perbaiki-tryout-backend-free-access-35-item-dan-kontrak-tiga-format), phase akses sudah diimplementasikan; tersisa 35 item, kontrak tiga format/rubrik, dan listing/detail/Past.

| Bagian                            | Jawaban dari PDF                                                           | Kekurangan / pekerjaan                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Akses gratis Mandiri/Sekolah      | Bukan fokus sumber                                                         | Sudah ditangani tahap pertama; tidak perlu diulang                                                     |
| Paket 35 dan delivery tiga format | Shared package, freeze item/rubrik, konteks batch jelas                    | 35/format berasal dari PRD; validator/delivery dan approved composition belum diberikan PDF            |
| Answer contract dan save/resume   | Raw answer, omission, item/max score, policy version, snapshot/idempotency | Belum ada wire format DTO/union, category/option ID semantics atau aturan clear/partial save API final |
| Penskoran PGK                     | Arah partial credit + GPCM dijelaskan                                      | Rubrik numerik MCMA/Kategori, select-all/penalti/bobot/pembulatan **tetap OPEN**                       |
| Listing/detail/Ongoing/Past       | Tidak dibahas sebagai API/listing policy                                   | Eligibility Past never-attempted **tetap OPEN**; bentuk API/rules UI masih harus dirancang             |
| Durasi dan akhir batch            | Close -> freeze -> calibrate -> release; cutoff harus konsisten            | Angka durasi, batch end, sesi melampaui akhir periode/delayed upload belum ditentukan                  |
| Model/release/low response        | Arah 2PL/GPCM, theta batch, quality gates dan fallback rinci               | Terutama membantu **JOB-10**, butuh approval konfigurasi/model/mapping/failure                         |
| Auto-finalization                 | Ada langkah finalisasi sebelum snapshot                                    | Membantu boundary **JOB-09**, bukan implementasi finalizer/timing lengkap                              |
| XP/history                        | Histori immutable, retry tidak menggandakan kontribusi                     | Membantu **JOB-11/12**; formula XP belum ada                                                           |
| Pilot, trial, generator, Compare  | Rancangan jauh lebih rinci                                                 | Scope varian/IRT Drill; bukan prasyarat mengerjakan seluruh JOB-07                                     |

### Langkah lanjutan yang diusulkan untuk Aini

**PROPOSED:** PR berikutnya fokus pada **fondasi kontrak tiga format + validator/delivery 35 soal + save/resume raw answer**, dengan pinned content/policy dan fixture mixed-format berlabel DEMO/TEST. Rancang response DTO dan regenerasi OpenAPI/shared types; gunakan opsi/pernyataan dari versi paket dan tolak ID/type yang tidak cocok. Jangan mengaktifkan penilaian PGK produksi atau publisher resmi tanpa rubrik approved.

Audit schema/runtime yang sudah ada dahulu untuk menentukan apakah persistence kategori/MCMA membutuhkan migrasi. Tahap akses sebelumnya tidak membutuhkan migrasi; hal itu tidak membuktikan tahap mixed-format juga tanpa migrasi. Kontrak generik dapat disiapkan saat keputusan scoring menunggu, tetapi tidak dinyatakan memenuhi acceptance final PGK.

Listing/detail/Past dapat menjadi PR terpisah; state dan CTA Past mengikuti keputusan Product. Pipeline batch, fallback, ranking dan score mapping tetap ditempatkan pada JOB-10, finalizer pada JOB-09, serta ledger XP pada JOB-11. Tidak perlu menggabungkan generator, A/B Drill, ML, atau equating ke PR lanjutan JOB-07.

Untuk melanjutkan final behavior, minta owner memberikan: **rubrik MCMA/Kategori lengkap; komposisi dan durasi; skala/mapping approved; Past eligibility; batch end/cutoff; persetujuan model/gate/fallback**. PDF menyediakan rancangan dan daftar keputusan, bukan semua nilai keputusan.

## 13. Checklist penerimaan dari sumber

**PROPOSED - PDF §18.1, hlm. 22-23.** ID AC berikut milik PDF, bukan pengganti AC PRD dan belum ditandai lulus.

| ID sumber | Ringkasan skenario                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| AC01      | Cold start original saja; A/B/kandidat diblokir sampai baseline dan referensi layak; tanpa parameter empiris palsu |
| AC02      | Refresh mempertahankan paket; retry memakai varian berbeda atau status stok belum tersedia                         |
| AC03      | Satu paket dan scoring version untuk seluruh peserta TryOut batch                                                  |
| AC04      | Paparan keluarga focal/referensi lintas modul diperiksa; repeat bukan evidence bersih baru                         |
| AC05      | Model/kategori sesuai scoring policy; PGK tanpa rubrik final diblokir                                              |
| AC06      | Compare hanya skala kompatibel; beda level/lintas batch `NOT_COMPARABLE`                                           |
| AC07      | Insufficient tidak memicu adjust; anomaly menahan auto-publish                                                     |
| AC08      | Regenerate dibatasi; config baru tidak mengubah kandidat/hasil historis                                            |
| AC09      | Tidak ada theta profile bab; Drill tidak memengaruhi TryOut; pola sama menghasilkan hasil sama                     |
| AC10      | Satu score mode utama batch; contributing items konsisten seluruh peserta                                          |
| AC11      | Hasil dan seluruh pembahasan dirilis pada tenggat, termasuk fallback approved                                      |
| AC12      | Retry ingestion/submit/job tidak menggandakan respons/nilai/XP/publikasi                                           |
| AC13      | Tren membedakan mode dan tidak mengklaim kenaikan theta absolut antarbatch                                         |
| AC14      | Revisi item/parameter mempertahankan akses versi dan hasil historis                                                |
| AC15      | Assignment A/B 1:1 tetap saat resume; peserta tidak menerima kedua arm/focal sekeluarga                            |
| AC16      | Trial tidak mengubah progres/reward; pembahasan setelah collection close                                           |
| AC17      | Ability cohort boleh berbeda; identifikasi/invariance referensi tetap diperiksa                                    |
| AC18      | 30 eligible unik hanya mulai analisis; uncertainty/coverage dapat menahan calibration/PASS                         |
| AC19      | Original/referensi drift menahan Compare; pergantian acuan berversi dan diaudit                                    |
| AC20      | Item PASS bukan paket READY; seed/config baru tidak mewarisi evidence/lolos                                        |
| AC21      | Cohort fase kedua disiapkan sebelum pilot; paparan focal/referensi membatalkan eligibility terkait                 |
| AC22      | Revisi original memakai versi/dataset/baseline baru; original gagal bukan target generator                         |

Pengujian aplikasi baru disusun saat scope implementasi dipilih. Penambahan knowledge ini tidak menjalankan atau meluluskan AC di atas.
