# Paket kandidat review Ferdi

**PROPOSED:** empat set berlabel **DEMO / DRAFT**, masing-masing 10 soal: Level 1 dan Level 2, setiap level memiliki V1/V2. Ini bahan review Curriculum, bukan konten approved. `manifest.json` mencatat reviewer/tanggal review kosong dan `published: false`. Tidak ada penulisan database atau publikasi dari direktori ini.

Level 1 melatih persamaan linear satu variabel. Level 2 memakai model persamaan dalam konteks sehari-hari. Kode taxonomy `DEMO-FERDI-*` sengaja bersifat sementara; Curriculum harus menentukan mapping bab/subbab/kompetensi/level yang disetujui, kecocokan kesulitan, distractor, bahasa, dan kesetaraan varian. Kandidat tidak membuktikan kesiapan trial sekolah.

Validasi teknis dari root repository:

```powershell
node scripts/validate-ferdi-review-content.mjs
```

Validator memeriksa schema impor existing, 10 soal/set, ID unik, persamaan/kunci, empat opsi berbeda, dan label belum reviewed. Distribusi kunci tiap set mencakup A–D. Penilaian akademik tetap memerlukan Curriculum.

Sesudah review, gunakan workflow Admin/Content canonical yang sudah ada: buat konten/keluarga ORIGINAL dan VARIANT, revisi bila diperlukan, tetapkan reviewer melalui READY, susun paket Drill Level 1/2 dengan versi soal yang dipilih dan policy approved, lalu publish melalui endpoint existing. Jangan mengimpor file ini langsung sebagai READY, membuat pipeline paralel, atau mengganti data legacy.

Gate berikutnya: reviewer Curriculum konkret dan mapping taxonomy, video YouTube relevan yang terkurasi, policy server yang disetujui, serta acceptance Admin publish → Student Level 1 → unlock → Level 2 → retry. Tidak ada video atau nilai policy final yang diisi dengan tebakan.
