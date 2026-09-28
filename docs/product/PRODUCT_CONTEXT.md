# Product Context — Numora

**Product source:** team-approved PRD v0.5, 28 September 2026. The supplied PDF still labels itself a consolidated draft for review; the Software Engineering coordinator confirmed team approval on 28 September 2026. Explicit OPEN items remain unresolved.
**Document purpose:** shared context for Software, Data/AI, QA, UI/UX, Research & Curriculum, and coding agents.

## 1. Tujuan dan tahap produk

Numora menyediakan latihan TKA Matematika bagi siswa kelas IX SMP/MTs melalui web responsif. Hipotesis masalahnya: latihan belum terarah, hasil kurang memberi tindak lanjut, guru sulit memantau progres, dan latihan dapat membosankan. Hipotesis ini perlu diuji dengan pengguna; daftar fitur bukan bukti validasi.

Target terdekat adalah **staging online siap diuji sekitar 12 Oktober 2026** oleh Siswa dan Guru sungguhan dari sekolah. Perkiraan awal peserta adalah **lebih dari 20 Siswa dan/atau beberapa Guru/Kelas**; jumlah tepatnya belum ditetapkan. Uji coba pertama mencakup Siswa yang bergabung ke kelas; alur User Mandiri menyusul.

Ruang lingkup minimum prototipe:

- Admin melihat daftar, membuat, mengedit, dan mengubah status sekolah; menerbitkan, membuat ulang, dan mencabut token guru melalui UI.
- Guru login Google, memilih sekolah, memverifikasi token, membuat kelas, lalu membuka daftar kelas dan detail siswa miliknya. Detail menunjukkan status level serta nilai Drill terakhir dan terbaik.
- Siswa login Google, bergabung ke kelas, mengerjakan 10 soal PG demo Level 1 berupa teks dan rumus matematika sederhana, lalu melihat hasil/progres tersimpan; skor **≥80%** membuka Level 2.
- Draf soal demo disiapkan tim Software bersama Curriculum, diberi label jelas, dan **ditinjau Curriculum sebelum uji coba**; hasilnya tidak dipresentasikan sebagai ukuran kemampuan TKA resmi.
- Uji coba belum dimulai jika login, hak akses, penyimpanan jawaban/hasil, atau aturan unlock 80% gagal. Tim Product/Design bersama sekolah mengurus izin sekolah, persetujuan peserta/wali bila diperlukan, dan pemberitahuan soal demo.

Domain staging serta akses proyek Supabase/Google OAuth **belum tersedia** pada 28 September 2026; penyediaannya adalah dependensi nyata untuk uji coba online. Guru hanya boleh melihat progres siswa dari kelas yang ia kelola.

Desain/wireframe masih akan disiapkan divisi UI/UX. **Mock UI sederhana boleh dipakai untuk pengembangan awal dan uji coba sekolah pertama**, selama alur berfungsi dan aksesibilitas dasarnya terpenuhi. Penyedia hosting staging belum dipilih. Koordinasi domain oleh DevOps dan Supabase/Google OAuth oleh tim Database adalah perkiraan pembagian kerja yang **belum dikonfirmasi**.

Uji coba pertama hanya menguji rantai **Admin → Guru → Siswa → Drill → progres Guru**. Pretest, Tryout, PvP, leaderboard, feedback, dan alur Mandiri tetap bagian dari PRD v0.5 tetapi bukan sasaran sesi pertama.

Pengembangan untuk penggunaan lebih luas adalah tahap berikutnya. Sasaran Sprint 2 yang lebih sempit ada di `docs/development/SPRINT_2_GOAL.md`.

## 2. Skema pengguna, peran, dan akses

Role tetap `Student`, `Teacher`, dan `Admin`. `Student` memiliki dua status afiliasi, bukan dua role baru:

| Status Student | Akses MVP v0.5 | Batas utama |
|---|---|---|
| User Mandiri | Login Google, Drill, membuat room PvP dan membagikan kode, leaderboard PvP global | Belum bergabung kelas; Pretest, Tryout, leaderboard kelas, dan undangan teman sekelas terkunci; tryout berbayar ditunda dari MVP |
| User Terafiliasi Sekolah | Seluruh fitur belajar yang tersedia gratis; leaderboard kelas dan global; dapat mengundang teman sekelas ke PvP | Maksimal satu kelas; tidak melihat hasil pribadi siswa lain |

User Mandiri dapat bergabung ke kelas dengan kode/QR/link valid dan menjadi User Terafiliasi Sekolah. Siswa tidak dapat keluar/berpindah kelas sendiri; penanganan oleh Admin serta dampaknya pada riwayat/progres masih `OPEN-08`/`OPEN-15`. Afiliasi kelas harus diperiksa di server. Riwayat Student Mandiri tetap disimpan.

Hierarki operasional sekolah: `Admin → School → Verified Teacher → Class → Student`. Guru yang terverifikasi dapat membuat banyak kelas, melihat progres siswa pada kelasnya, dan memberi feedback satu arah. Guru tidak mengelola bank soal. Admin adalah satu role internal pada v0.5, mengelola sekolah/token, pengguna/kelas, konten/paket, laporan, IRT/analitik, dan audit. Pemecahan sub-role Admin masih `OPEN-16`. Admin tidak dapat mengubah parameter inti produk melalui UI.

## 3. Autentikasi, sekolah, dan kelas

- Student dan Teacher login dengan Google. Saat registrasi pertama, user memilih role dan melengkapi profil; role tidak dapat diubah sendiri. Foto mengikuti Google dengan avatar inisial sebagai fallback. Admin memakai akun internal/seeder.
- Admin membuat sekolah dan menerbitkan token verifikasi guru yang single-use, berlaku 3×24 jam, dapat diterbitkan ulang, dan hangus setelah dipakai. Guru memilih sekolah dan memasukkan token; token gagal tidak membuka fitur Guru.
- Guru terverifikasi membuat kelas dengan kode/link/QR. Student bergabung lewat salah satunya dan hanya boleh menjadi anggota satu kelas dalam versi ini.
- Tanpa kelas, Student tetap boleh mengerjakan Drill dan membuat/membagikan room PvP. Pretest, Tryout, dan leaderboard kelas memerlukan keanggotaan kelas.

## 4. Materi dan Pretest

Hierarki akademik: `Chapter → Subchapter → Level`. PRD v0.5 memberi baseline 5 level per subbab dan 10 soal per level, tetapi juga menyerahkan daftar, urutan, jumlah level, kompetensi, dan definisi tuntas kepada Curriculum (`OPEN-01`). Jangan mengunci skema ke angka lima sebelum keputusan Curriculum; gunakan konten demo yang diberi label jelas.

Pretest opsional, maksimal sekali selesai per bab, dapat dilewati, dan tidak memberi XP. Baseline: 20 soal per bab, diusahakan mewakili seluruh subbab. Tanpa Pretest, Level 1 tiap subbab terbuka. Hasil sempurna dapat membuka maksimal 3 level per subbab. Distribusi soal (`OPEN-02`) serta pemetaan hasil yang tidak sempurna ke level (`OPEN-03`) belum final. Pretest yang sedang berlangsung dilanjutkan saat refresh dan level yang sudah terbuka tidak dikunci kembali.

## 5. Drill, progres, bintang, dan XP

- Student memilih Bab → Subbab → Level; Level terkunci tidak boleh dimulai.
- Satu sesi berisi 10 soal untuk satu level. Timer count-up tanpa batas produk. Jawaban boleh dilewati/diubah dan soal dapat dinavigasi sebelum submit; konfirmasi submit menampilkan jumlah soal kosong.
- Ambang Ketuntasan v0.5 adalah **80%**. Skor ≥80 membuka level berikutnya; skor lebih rendah tidak mencabut akses yang sudah dimiliki. Retry tanpa batas memakai varian setara yang berbeda. Refresh mempertahankan attempt dan paket yang sama.
- Jawaban disimpan selama sesi dengan status penyimpanan yang jelas. Koneksi putus tidak menghentikan timer. Submit berulang tidak membuat hasil/XP ganda.
- Hasil memuat nilai 0–100, poin mentah, jawaban, pembahasan, status ketuntasan, bintang, dan perubahan akses. Pembahasan Drill dapat diakses selama 90 hari sejak pengerjaan; riwayat hasil dan versi konten tetap dipertahankan.
- Bintang adalah dorongan psikologis, **bukan** syarat unlock atau pengali XP: 1 bintang untuk 10–50, 2 untuk 60–90, 3 untuk 100. Tampilan skor 0 belum dijelaskan eksplisit di PRD dan perlu klarifikasi sebelum final.
- Jika skor <80, hasil menampilkan hingga 3 video terkait subbab dari metadata tersimpan; tidak ada pencarian web saat request Student. Kondisi tanpa video tidak menghalangi hasil.
- PRD memberi baseline XP Drill: `(jumlahBenar × 100) + max(0, (15 − menit) × 10)`. Formula final masih `OPEN-11`; simpan versi kebijakan XP. Bintang tidak mengubah XP.

## 6. Tryout

- Paket baru rilis setiap **Senin 00:00 WIB**; paket lama dikunci saat paket baru rilis. Semua peserta pada periode yang sama mengerjakan paket yang sama untuk kebutuhan IRT. Satu paket hanya dapat dikerjakan sekali per user.
- User Sekolah mengakses paket berjalan secara gratis. Tryout berbayar bagi User Mandiri dan pembelian paket lama ditunda dari MVP (`OPEN-17`); jangan membuka akses berbayar tanpa alur yang disetujui.
- Hasil dan pembahasan tersedia setelah batch IRT terkait selesai, dengan target maksimum 3×24 jam setelah periode berakhir. Detail jaminan waktu batch masih `OPEN-18`. Paket lama yang pernah dikerjakan hanya dapat dibuka untuk pembahasan setelah syarat tersebut terpenuhi.
- Tryout tidak membuka level Drill. Jumlah soal, durasi, domain, bentuk, dan komposisi resmi masih `OPEN-05`. MVP penskoran fokus pilihan ganda satu jawaban; PGK menunggu `OPEN-04`.
- Nilai ditampilkan sebagai hasil simulasi, bukan nilai TKA resmi.

## 7. PvP dan leaderboard

PvP adalah pertandingan 1v1 realtime via WebSocket dan dapat mempertemukan Student Mandiri dengan Student Sekolah, termasuk lintas kelas. Semua Student boleh membuat room dan berbagi kode/link/QR; hanya Student Sekolah dapat mengundang teman sekelas lewat notifikasi. Kategori awal Mudah/Sedang/Sulit, 10 soal dengan urutan sama untuk kedua pemain, timer 30/45/60 detik per soal, jawaban terkunci setelah submit, dan transisi setelah kedua pemain menjawab atau waktu habis. Server menentukan waktu, validitas, dan poin. Jawaban benar memperoleh `100 + floor(50 × remainingTime / questionDuration)`; salah/kosong memperoleh 0. Reconnect 20 detik; gagal kembali berarti forfeit dan hasil itu tidak masuk rekor. Detail expiry/putus dua pemain masih `OPEN-07`.

| Papan peringkat | Peserta dan sumber | Periode |
|---|---|---|
| Kelas | Anggota kelas yang sama; akumulasi XP Drill + Tryout. Pretest/PvP tidak berkontribusi. Menunjukkan keaktifan, bukan kemampuan akademik. | Perbarui tiap jam; tutup/arsip Rabu 23:59 WIB. |
| Global PvP | Semua Student Mandiri dan Sekolah; best XP dari sesi PvP valid per kategori kesulitan. Tampilkan top 20 dan peringkat sendiri bila di luar top 20. | Perbarui tiap jam; tutup/arsip Rabu 23:59 WIB. |

Leaderboard menampilkan data identitas minimum, bukan email atau riwayat belajar pribadi. PvP XP tidak membuka level Drill.

## 8. Monitoring, dukungan, Admin, dan IRT

- Dashboard Student menunjukkan status mandiri/kelas, progres, level, bintang, nilai terakhir/terbaik, dan aktivitas. Nilai akademik dan XP keaktifan diberi label terpisah.
- Guru memilih kelas, mencari/mengurutkan siswa, melihat progres dan riwayat siswa miliknya, lalu memberi feedback satu arah maksimal 1.000 karakter dengan status dibaca. Ekspor laporan belum termasuk v0.5.
- Student dapat melaporkan soal atau video; laporan menyimpan referensi versi/varian/attempt yang relevan untuk ditinjau Admin. Student tidak memperoleh riwayat laporan atau notifikasi tindak lanjut pada versi ini.
- Admin mengelola konten versi/varian dan paket. Perubahan soal tidak menghitung ulang hasil lama; attempt tetap merujuk versi dan kebijakan penilaian yang digunakan.
- IRT adalah batch harian atas akumulasi respons. Hasil pada detail soal Admin memerlukan minimal 30 responden; di bawah itu tampilkan “Data belum cukup”. Model/parameter final masih `OPEN-12`. IRT tidak mengubah nilai/XP historis.

## 9. Batas kualitas dan status keputusan

Autorisasi, batas akses Mandiri/Sekolah, waktu asesmen/PvP, penilaian, dan idempotensi harus ditegakkan server-side. Simpan waktu durable dalam UTC; aturan jadwal bisnis menggunakan `Asia/Jakarta`. UI memerlukan state loading, kosong, gagal, validasi, sukses, sesi berakhir, dan akses ditolak. Perlindungan privasi siswa dan pengujian pengguna nyata harus disepakati sebelum uji coba.

PRD v0.5 **sudah disetujui tim sebagai acuan kerja**, walaupun label pada PDF yang diberikan masih menyebut “draf untuk review”. `docs/product/OPEN_DECISIONS.md` mencatat keputusan yang tetap belum final. Dokumen Sprint 2 yang diberikan masih mencantumkan 70% untuk unlock Drill; tim menegaskan bahwa aturan PRD v0.5, yaitu **80%**, berlaku juga untuk Sprint 2.

Peristiwa analitik tambahan v0.5 antara lain `user_type_changed` dan `star_earned`; kontrak lengkap ada di `docs/data/EVENTS.md`. Kebutuhan keamanan, privasi, observabilitas, dan QA ada di folder `docs/security`, `docs/operations`, serta `docs/testing`.
