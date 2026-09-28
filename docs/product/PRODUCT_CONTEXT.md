# Product Context — Platform Latihan TKA Matematika SMP

**Product source:** PRD v0.4, 22 September 2026.  
**Document purpose:** concise shared context for Software, Data, QA, UI/UX, and AI coding agents.  
**Language note:** business/product rules are written in Indonesian; technical identifiers remain English.

## 1. Tujuan produk

Platform menyediakan latihan mandiri TKA Matematika untuk siswa kelas IX SMP/MTs dalam kelas digital yang berada di bawah sekolah terdaftar. Sekolah dikelola Admin, Guru terverifikasi membuat/mengelola kelas, dan Siswa bergabung menggunakan kode/QR/link kelas.

Hipotesis masalah produk menurut PRD:

- latihan belum terarah;
- hasil belum memberi tindak lanjut yang cukup;
- guru sulit memantau progres;
- latihan dapat menimbulkan kejenuhan.

Daftar fitur bukan bukti bahwa kebutuhan telah tervalidasi; validasi pengguna tetap diperlukan.

## 2. Hierarki operasional

```text
Admin
  └── School
       └── Verified Teacher
            └── Class
                 └── Student
```

Catatan: PRD mendefinisikan role utama Student, Teacher, dan Admin. Tidak ada role teknis terpisah bernama `SchoolAdmin` pada v0.4.

## 3. Peran dan batas akses

### Student

Hak utama:

- latihan/pretest/tryout;
- hasil dan riwayat pribadi;
- feedback pribadi;
- PvP;
- leaderboard.

Batas utama:

- hanya satu kelas pada versi awal;
- tidak mengelola soal;
- tidak melihat hasil pribadi siswa lain;
- tanpa kelas, pretest/drill/tryout/PvP terkunci.

### Teacher

Hak utama:

- membuat dan mengelola kelas;
- melihat progres siswa pada kelas yang dikelola;
- memberi feedback satu arah.

Batas utama:

- wajib terverifikasi pada sekolah;
- tidak membuat/mengelola bank soal;
- hanya dapat mengakses kelas dan siswa yang dikelola.

### Admin

Hak utama:

- sekolah dan token guru;
- akun/kelas;
- bank soal dan paket;
- laporan soal/video;
- IRT dan analitik;
- audit;
- ban/unban sesuai kebijakan produk.

Batas utama:

- tidak mengubah kebijakan produk;
- login melalui mekanisme internal/seeder.

## 4. Autentikasi, sekolah, dan kelas

### Authentication

- Student dan Teacher login menggunakan Google Auth.
- Role dipilih pada registrasi pertama dan tidak dapat diubah sendiri.
- Foto profil mengikuti Google; bila tidak ada, UI membuat fallback inisial.
- Admin menggunakan akun internal/seeder.

### Teacher verification

- Admin membuat sekolah.
- Admin dapat generate token verifikasi guru tanpa batas jumlah.
- Token single-use.
- Masa berlaku token: 3×24 jam.
- Token hangus setelah dipakai.
- Teacher memilih sekolah lalu mengirim token untuk verifikasi.
- Teacher dengan token gagal/tidak valid tidak dapat mengakses fitur Teacher.

### Class

- Verified Teacher dapat membuat banyak kelas.
- Sistem menghasilkan kode, link, dan QR.
- Student bergabung lewat kode/QR/link.
- Satu Student hanya satu kelas.

## 5. Materi dan pretest

Hierarki akademik:

```text
Chapter → Subchapter → Level
```

Curriculum menentukan daftar chapter/subchapter, kompetensi, urutan, jumlah level, dan kriteria kesulitan.

Pretest:

- opsional;
- maksimum sekali per chapter;
- dapat dilewati;
- membuka titik awal level per subchapter;
- tanpa pretest, Student mulai dari Level 1;
- tidak memberi XP/leaderboard;
- detail jumlah soal, durasi, placement, dan batas pembukaan masih OPEN-01 sampai OPEN-03.

## 6. Drill

Baseline PRD v0.4:

- memilih Chapter → Subchapter → Level;
- 10 soal per sesi satu level;
- navigasi bebas dan jawaban dapat diubah sebelum submit;
- timer count-up dan dinyatakan tidak dibatasi;
- mastery threshold/KKM: 70%;
- ≥70% membuka level berikutnya;
- retry tidak dibatasi;
- attempt berikutnya menggunakan variasi setara berbeda;
- setiap attempt final dicatat terpisah;
- pembahasan dapat diakses 90 hari;
- attempt yang gagal menampilkan maksimal 3 video rekomendasi terkait subchapter;
- formula XP final masih OPEN-11.

**Known ambiguity:** beberapa kalimat/acceptance criteria masih menyebut timeout atau “timer selesai” walaupun timer disebut count-up tanpa batas. Jangan menambahkan timeout produk tanpa klarifikasi PO.

## 7. Tryout

- simulasi TKA Matematika;
- paket dipilih backend, bukan Student;
- limit 1 start per hari berdasarkan tanggal mulai;
- reset 00:00 WIB (`Asia/Jakarta`);
- variasi berbeda pada attempt/hari berikutnya;
- hasil dan pembahasan tersedia setelah selesai;
- pembahasan tidak memiliki batas waktu;
- tidak membuka level Drill;
- MVP fokus PG; PGK menunggu OPEN-04;
- spesifikasi resmi jumlah/durasi/domain/difficulty/navigation menunggu OPEN-05.

**Known inconsistency:** satu paragraf masih menggunakan wording lama bahwa Tryout dapat diulang tanpa batas, tetapi ringkasan perubahan, bullet, dan acceptance criteria v0.4 menetapkan 1× per hari. Engineering baseline mengikuti daily limit sambil menjaga catatan klarifikasi.

## 8. XP dan leaderboard

### Class leaderboard

- scope: anggota kelas yang sama;
- sumber: akumulasi XP Drill + Tryout;
- Pretest dan PvP tidak berkontribusi;
- update setiap 1 jam;
- reset/close period Rabu 23:59 WIB;
- periode lama diarsipkan, bukan dihapus;
- makna: keaktifan latihan, bukan ukuran kemampuan akademik.

### PvP leaderboard

- global;
- kategori Easy/Medium/Hard (nama kategori masih dapat berubah);
- berdasarkan Best XP per sesi valid;
- update setiap 1 jam;
- reset/arsip Rabu 23:59 WIB;
- top 20 + peringkat sendiri bila di luar top 20.

Formula XP Drill/Tryout final masih OPEN-11.

## 9. PvP

- satu-satunya minigame versi awal;
- 1v1 realtime via WebSocket;
- lintas kelas diperbolehkan selama dua pemain adalah Student yang valid;
- room melalui kode/link/QR;
- dapat invite teman sekelas via notifikasi;
- 10 soal;
- kedua pemain menerima soal dan urutan yang sama;
- jawaban dikunci setelah submit;
- soal berikutnya saat kedua pemain sudah menjawab atau timer habis;
- server menentukan waktu, jawaban valid, dan skor;
- reconnect window: 20 detik;
- tidak kembali → forfeit;
- forfeit tidak memperbarui rekor leaderboard;
- PvP XP tidak masuk class leaderboard.

Baseline score PvP:

- benar: 100 poin dasar;
- bonus kecepatan maksimum: 50;
- `floor(50 × remainingTime / questionDuration)`;
- salah/kosong: 0;
- timer per question: Easy 30s, Medium 45s, Hard 60s.

## 10. Monitoring, feedback, rekomendasi, laporan

Teacher monitoring:

- memilih kelas;
- daftar siswa, search/sort;
- detail progres/riwayat;
- feedback maksimum 1.000 karakter;
- feedback satu arah dan mempunyai read state.

Recommendation:

- maksimal 3 video per subchapter;
- video dicari/dihimpun sebelumnya dan disimpan sebagai metadata DB;
- tidak melakukan web search realtime pada request Student;
- Student dapat melaporkan video tidak relevan.

Reporting:

- Student dapat melaporkan soal maupun video;
- laporan memiliki kategori dan referensi target;
- Admin menindaklanjuti;
- Student tidak memiliki history laporan atau notifikasi tindak lanjut pada versi awal.

## 11. Admin dan integritas historis

Admin mengelola:

- school/token;
- classes, mentors/participants, ban/unban;
- question bank, variants, statuses;
- packages untuk pretest/drill/tryout/PvP;
- video;
- question/video reports;
- IRT;
- analytics;
- audit.

Historical integrity:

- revisi/arsip soal tidak mengubah skor/poin lama;
- snapshot/version konteks soal harus tersedia untuk result lama;
- product parameters MVP tidak diubah melalui Admin UI.

## 12. IRT

- batch harian;
- menggunakan akumulasi response;
- PRD baseline minimum 30 response sebelum ditampilkan;
- output dapat mencakup difficulty, discrimination, guessing sesuai kemampuan Data team;
- hasil ditampilkan pada detail question Admin;
- tidak mengubah nilai/poin attempt historis;
- model/parameter statistik detail masih OPEN-12.

## 13. Analytics events

PRD menyebut antara lain:

`account_registered`, `class_joined`, `assessment_started`, `assessment_completed`, `level_unlocked`, `explanation_viewed`, `feedback_sent`, `feedback_read`, `question_reported`, `pvp_disconnected`, `school_created`, `token_generated`, `teacher_verified`, `class_created`, `pretest_started`, `drill_started`, `drill_completed`, `tryout_started`, `tryout_completed`, `pvp_started`, `pvp_completed`, `video_reported`, `leaderboard_archived`, `irt_calculated`, `pvp_cancelled`.

Event schema rinci harus disepakati bersama Data dan PO.

## 14. Nonfunctional baseline

PRD v0.4 meminta:

- server-side access validation;
- refresh tidak menduplikasi attempts/points/PvP answers;
- authoritative time behavior;
- responsive interface, keyboard navigation, form labels, no color-only status;
- loading/empty/error/validation/success/session-end/access-denied states;
- privacy according to role/class;
- traceable failures;
- WebSocket PvP;
- automated leaderboard update/archive;
- daily IRT batch;
- server-side validation for single-use teacher tokens.

Engineering alignment additionally targets mobile-first web, WCAG 2.2 AA where feasible, and production capacity/load testing before real-user release.
