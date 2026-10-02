# Feedback, riwayat Guru, dan Admin read operations

**ENGINEERING IMPLEMENTATION:** ownership backend sementara Ferdi disetujui pengguna 2 Oktober 2026; review Aini dan acceptance independen diperlukan. Base `/api/v1`, Bearer Auth, UUID, camelCase, application/problem+json. Actor selalu dari sesi server; tipe consumer generated OpenAPI.

| Method/path | Input/hasil | Otorisasi |
| --- | --- | --- |
| GET/POST `/classes/{classId}/students/{studentId}/feedback` | POST `{clientRequestId:uuid,body:string}` → `{id}`; GET `{items,nextOffset}` | Teacher aktif/verified, sekolah/verifikasi membership aktif, kelas nonarchived miliknya, Student aktif anggota kelas |
| GET `/classes/{classId}/students/{studentId}/assessment-results` | `cursor?:uuid` → existing AssessmentHistoryDto | Guard sama; page/cursor hanya classIdAtStart tersebut, bukan sekolah/kelas sebelumnya |
| GET `/students/me/feedback` | `{items,nextOffset}` | Student aktif, hanya pesannya sendiri termasuk historis |
| GET `/students/me/feedback/summary` | `{unreadCount,latest}` maksimal tiga | Student aktif; preview tidak mengubah read-state |
| POST `/students/me/feedback/{feedbackId}/read` | `{id,readAt}` | Student aktif pemilik; timestamp pertama dipertahankan pada retry/concurrency |
| GET `/admin/users` dan `/admin/users/{userId}` | List/detail; search ≤100, role STUDENT/TEACHER/ADMIN, status ACTIVE/DISABLED | Admin aktif |
| GET `/admin/classes` dan `/admin/classes/{classId}` | List/detail; search ≤100, schoolId, teacherId, state active/archived | Admin aktif |

Pagination feedback/Admin: limit 1–100 default 20, offset 0–1.000.000, nextOffset hanya jika ada baris tambahan. Urutan sentAt/id atau createdAt/id stabil; dataset yang berubah concurrent tetap memiliki keterbatasan offset pagination. Search parameterized, wildcard literal di-escape.

Body feedback setelah trim harus 1–1000 karakter non-whitespace. clientRequestId wajib, memakai primary key UUID existing dan advisory transaction lock. Actor/class/student/body sama mengembalikan ID awal; reuse berbeda 409. Read memakai row lock dan tidak menimpa timestamp pertama. Verifikasi membership/class dikunci saat create. Browser tidak boleh mengirim teacherId/reporterId.

Feedback DTO: id/classId/studentId/teacherName/body/sentAt/readAt. User Admin: id/displayName/role/status/createdAt. Class Admin: id/name, schoolId/name, teacherId/name, jumlah anggota aktif, createdAt/archivedAt. Tidak mengirim email/authUserId/verification token/joinCode.

**OPEN-08/13/15:** ban, correction/transfer/affiliation mutation menunggu policy, transaksi/audit dan pelestarian history approved. Frontend Admin milik Avicenna; Teacher feedback/Student inbox milik aliwafa. Ferdi menambahkan preview dashboard saja.

**PROPOSED analytics:** feedback_sent dan first feedback_read memakai existing outbox dalam transaksi mutasi yang sama jika gate Data aktif. Payload hanya ID yang didokumentasikan EVENTS; tidak memuat isi feedback/nama/email. Default gate off tidak mengurangi persistence feedback.

Tes HTTP/PostgreSQL: role/verification/disabled/ownership, batas input, concurrent create/read, replay conflict, summary/pagination, history/cursor lintas kelas dan Admin guard/minimal fields/filter. Auth boundary test diganti fixture; bukan bukti Google OAuth atau acceptance consumer frontend.
