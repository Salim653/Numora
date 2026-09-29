# Teacher Monitoring tahap 1

## Kontrak yang sudah tersedia

**PRD RULE:** Teacher hanya boleh membaca Student dari Class yang ia kelola. Monitoring tidak mengubah hasil Assessment atau Progress.

**ENGINEERING DECISION:** Endpoint baca berikut memerlukan bearer token Supabase yang dipetakan ke akun Teacher aktif dan keanggotaan sekolah terverifikasi yang masih berlaku. Class arsip dan anggota yang sudah keluar tidak masuk hasil.

- `GET /api/v1/classes` → `{ "items": [{ "id": "UUID", "name": "IX A", "joinCode": "KODE" }] }` untuk Guru pemilik Class.
- `GET /api/v1/classes/{classId}/students` → `{ "class": { "id": "UUID", "name": "IX A" }, "items": [{ "id": "UUID", "displayName": "Nisa" }] }`.

Kesalahan memakai `application/problem+json`: 401 untuk sesi tidak berlaku, 403 untuk role/verifikasi/kepemilikan yang tidak memenuhi syarat, dan 404 untuk Class yang tidak ada atau diarsipkan. Path ID divalidasi sebagai UUID. Daftar Student hanya mengirim identitas minimum tanpa email atau kode join.

## Alur persiapan Class

**PRD RULE:** Token Guru berlaku 3×24 jam dan sekali pakai. Siswa hanya boleh menjadi anggota aktif satu Class.

**ENGINEERING IMPLEMENTATION awaiting FE/BE/QA review:** Admin yang sudah diprovisikan mengelola sekolah dan token melalui `/api/v1/admin/schools`. Token acak hanya dikembalikan ketika diterbitkan atau diterbitkan ulang; database menyimpan SHA-256, waktu kedaluwarsa, pemakaian, dan pencabutan. Guru memilih sekolah aktif dan mengirim token ke `POST /api/v1/schools/{schoolId}/teacher-verifications`. Konsumsi token dan pembuatan keanggotaan Guru berlangsung dalam satu transaksi; kondisi belum terpakai, belum dicabut, dan belum kedaluwarsa diperiksa saat pembaruan. Guru terverifikasi membuat Class melalui `POST /api/v1/classes`; respons dan daftar Class miliknya memuat `joinCode`. Siswa bergabung melalui `POST /api/v1/classes/join` dan keunikan anggota aktif ditegakkan indeks database. Akun Admin belum dapat didaftarkan dari formulir publik; kebijakan autentikasi Admin final mengikuti OPEN-14.

## Student Detail Drill demo

**ENGINEERING IMPLEMENTATION awaiting FE/BE/QA review:** `GET /api/v1/classes/{classId}/students/{studentId}/progress` mengembalikan identitas Student dan daftar Level terbit dalam urutan Content. Setiap baris memuat `levelId`, label bab/subbab/Level, `accessStatus: "LOCKED" | "UNLOCKED"`, `inProgress`, `latestDrillScore: number | null`, dan `bestDrillScore: number | null`. Level pertama terbuka menurut baseline PRD; level berikutnya terbuka hanya setelah progres tersimpan. Skor 0 adalah nilai nyata; `null` berarti belum ada hasil. Latest ditentukan oleh waktu finalisasi terbaru; best adalah skor final tertinggi. Riwayat sebelum Student bergabung tetap terlihat selama ia menjadi anggota aktif Class Teacher tersebut. Endpoint memanggil pemeriksaan Class milik Teacher yang sudah ada sebelum membaca progres.

**OPEN-01:** Definisi _Tuntas_ dan taksonomi final belum disetujui. Monitoring tahap ini tidak menampilkan interpretasi akademik _Tuntas_; data level demo dan status akses mengikuti aturan Drill v0.5. Endpoint memerlukan migrasi Core Learning sebelum dapat dipakai di Cloud Development.
