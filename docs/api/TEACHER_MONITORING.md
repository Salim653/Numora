# Teacher Monitoring tahap 1

## Kontrak yang sudah tersedia

**PRD RULE:** Teacher hanya boleh membaca Student dari Class yang ia kelola. Monitoring tidak mengubah hasil Assessment atau Progress.

**ENGINEERING DECISION:** Endpoint baca berikut memerlukan bearer token Supabase yang dipetakan ke akun Teacher aktif dan keanggotaan sekolah terverifikasi yang masih berlaku. Class arsip dan anggota yang sudah keluar tidak masuk hasil.

- `GET /api/v1/classes` → `{ "items": [{ "id": "UUID", "name": "IX A" }] }`.
- `GET /api/v1/classes/{classId}/students` → `{ "class": { "id": "UUID", "name": "IX A" }, "items": [{ "id": "UUID", "displayName": "Nisa" }] }`.

Kesalahan memakai `application/problem+json`: 401 untuk sesi tidak berlaku, 403 untuk role/verifikasi/kepemilikan yang tidak memenuhi syarat, dan 404 untuk Class yang tidak ada atau diarsipkan. Path ID divalidasi sebagai UUID. Nama dan identitas minimum saja yang dikirim; email dan kode join tidak disertakan.

## Dependensi Student Detail

**PROPOSED — menunggu kesepakatan tim Content, Assessment, dan Progress:** `GET /api/v1/classes/{classId}/students/{studentId}/progress` mengembalikan identitas Student dan daftar seluruh Level terbit dalam urutan Content. Setiap baris memuat `levelId`, label bab/subbab/Level, `accessStatus: "LOCKED" | "UNLOCKED" | null`, `latestDrillScore: number | null`, dan `bestDrillScore: number | null`. Progress adalah pemilik status akses dan agregat latest/best dari attempt Drill yang telah final. Skor 0 adalah nilai nyata; `null` berarti data belum ada. Latest ditentukan oleh waktu finalisasi terbaru; best adalah skor final tertinggi. Riwayat sebelum Student bergabung tetap terlihat selama ia menjadi anggota aktif Class Teacher tersebut.

**OPEN-01:** Definisi _Tuntas_ dan taksonomi final belum disetujui. Monitoring tahap ini tidak menafsirkan ketuntasan atau mengisi status akses dari ketiadaan record. Endpoint progres belum diaktifkan sebelum skema dan layanan pemilik data tersedia.
