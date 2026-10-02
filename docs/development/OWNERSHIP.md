# Software Engineering Ownership

This file records the original job-list and the approved progress-work assignments below. The 1 October 2026 assignments are the current execution reference. GitHub write access to the repository has not been verified.

## Team structure clarified on 28 September 2026

- **Departemen Software Engineering** combines the divisions and coordinates shared engineering decisions/work.
- A **divisi** is the primary engineering discipline, such as Frontend Engineering or Backend Engineering.
- A **tim** focuses on a feature area while members retain their division scope. For example, a Frontend member in Core Learning/PvP owns frontend work for those features, not backend domain policy.
- The coordinator who supplied this context leads the Software Engineering department, belongs to the Frontend Engineering division, and works on Core Learning and PvP frontend. Product/academic OPEN decisions are made jointly with the responsible PO, Curriculum, Data, Software, and QA owners; department coordination is not unilateral product approval.

| Member | GitHub | Role | Main ownership | Secondary ownership |
|---|---|---|---|---|
| Ferdiansyah Dwana Putra S | `@splakplutoy` | Frontend | Core Learning | PvP & Leaderboard |
| Avicenna A. G. M Benamen | `@Noir-MD` | Frontend | Admin & Content | Core Learning |
| Abdullah Ali Wafa | `@a-ali-wafa` | Frontend | Onboarding | Monitoring |
| Qurotul A'ini | `@ayiinee` | Backend | Core Learning | PvP & Leaderboard |
| Mch. Andi Mai Fatah | `@fathh04` | Backend | Onboarding | Monitoring |
| Tangguh Ittibaur Rosul | `@tangguhir` | Backend | Admin & Content | — |
| Nafi' Azka Fuadi | `@NafiAzka` | Backend | Core Learning | — |
| Muhammad Salim Ramadhan | `@Salim653` | QA | Testing | Testing |

## Pembagian pengerjaan progress disetujui — 1 Oktober 2026

**ENGINEERING DECISION:** koordinator mengonfirmasi bahwa pembagian berikut telah disetujui bersama. Tabel 28 September di atas dipertahankan sebagai catatan struktur awal; pembagian di bagian ini menjadi acuan pengerjaan progress saat ini. Penugasan lintas divisi Ferdi dan penggantian Wafa oleh Farel disetujui untuk pekerjaan ini. Penugasan tersebut tidak mengubah aturan PRD atau kewenangan keputusan akademik/produk.

| Anggota | Tanggung jawab pengerjaan saat ini |
|---|---|
| Ferdiansyah Dwana Putra S (`@splakplutoy`) | Frontend Core Learning Student, PvP, dan leaderboard; backend pipeline Admin/Content, laporan/video, serta integrasi IRT. Mengkoordinasikan pembaruan status docs. Model statistik IRT tetap tanggung jawab Data. |
| Avicenna A. G. M Benamen (`@Noir-MD`) | Frontend Admin/Content, riwayat Penilaian **#4**, dan Pretest **#7** sesuai ownership sekunder Core Learning, untuk membagi beban frontend Ferdi. |
| Farel (PM) | Menggantikan pekerjaan frontend Wafa yang berhalangan: onboarding, monitoring, join kelas, dan integrasi browser tiga peran. Tetap menjalankan koordinasi PM; kapasitas implementasi memperhitungkan pekerjaan koordinasi. Nama lengkap dan akun GitHub belum dicatat. |
| Qurotul A'ini (`@ayiinee`) | Backend PvP, leaderboard, worker/outbox, dan engine asesmen, terutama **#4, #7, #8**, termasuk integrasi ledger XP dan konten. |
| Mch. Andi Mai Fatah (`@fathh04`) | Backend identity, kelas/keanggotaan, feedback/monitoring, serta proteksi alur onboarding. Mendukung integrasi operasional Admin terkait identity dan kelas. |
| Muhammad Salim Ramadhan (`@Salim653`) | Acceptance criteria, E2E, regresi, dan bukti release. QA dilibatkan sejak penyusunan kontrak dan acceptance criteria. Tes unit/integrasi tetap dikerjakan pemilik implementasi. |

Frontend Admin/Content dimiliki Avicenna, sedangkan pipeline backend-nya dimiliki Ferdi. Frontend monitoring/onboarding dimiliki Farel, sedangkan backend-nya dimiliki Andi. Frontend asesmen/PvP/leaderboard mengikuti pembagian Ferdi dan Avicenna di atas, dengan backend asesmen/PvP/leaderboard dimiliki Qurotul. Tangguh dan Nafi tetap tercatat pada struktur awal; cakupan pekerjaan mereka dialihkan melalui pembagian progress ini, bukan dihapus dari histori tim.

### Referensi nomor pekerjaan

Nomor berikut berasal dari audit progress terhadap PRD v0.5. Daftar ini adalah backlog engineering, bukan aturan produk baru atau klaim fitur selesai. Rujuk [PRD_MAPPING](../product/PRD_MAPPING.md), [PRODUCT_CONTEXT](../product/PRODUCT_CONTEXT.md), dan [OPEN_DECISIONS](../product/OPEN_DECISIONS.md) untuk perilaku dan dependensi produk.

| No. | Pekerjaan |
|---|---|
| 1 | Provisioning Admin dan pembuktian alur Admin → Teacher → Student melalui browser. |
| 2 | Paket Level 2 dan kelanjutan Drill setelah unlock. |
| 3 | Pipeline Admin untuk menyusun dan menerbitkan paket Drill. |
| 4 | API dan UI riwayat Penilaian Student. |
| 5 | Kesiapan uji sekolah, review konten, proteksi API, dan bukti release. |
| 6 | Ledger XP, pemrosesan outbox, dan analytics. |
| 7 | Pretest. |
| 8 | Tryout. |
| 9 | Pipeline dan integrasi IRT. |
| 10 | Feedback dan monitoring Teacher. |
| 11 | Rekomendasi video dan laporan Student. |
| 12 | PvP realtime. |
| 13 | Leaderboard berbasis data server. |
| 14 | Operasional Admin pengguna dan kelas. |
| 15 | Dashboard Student serta berbagi/join kelas melalui link dan QR. |
| 16 | Pembaruan status docs dan penerapan handoff visual yang disetujui. |

### Tahap pertama dan pengendalian beban

**ENGINEERING DECISION:** mulai dari **#1–5** dengan pembagian berikut. Pengerjaan paralel dilakukan sesuai kesiapan kontrak dan dependensi, bukan dengan membuka seluruh backlog sekaligus.

| Anggota | Pekerjaan awal |
|---|---|
| Ferdi | **#3** backend paket Drill, dukungan frontend **#2**, dan koordinasi **#16**. |
| Avicenna | **#3 dan #4** frontend. |
| Farel | **#1 dan #5** frontend onboarding, integrasi browser, dan koordinasi kesiapan trial. |
| Qurotul | **#2 dan #4** backend; siapkan kontrak riwayat lebih awal untuk Avicenna. |
| Andi | **#1 dan #5** backend provisioning, identity/kelas, dan proteksi onboarding. |
| Salim | Acceptance criteria, E2E, regresi, dan bukti untuk **#1–5**. |

- Qurotul membatasi satu pekerjaan besar aktif. Lanjutkan fondasi **#6**, kemudian **#7–8**; jangan mengerjakan **#12** bersamaan dengan seluruh **#6 dan #13**. Leaderboard mengikuti kesiapan ledger dan hasil PvP.
- Ferdi melanjutkan **#11**, lalu **#9** bersama Data; frontend PvP mengikuti kesiapan kontrak backend. Avicenna melanjutkan frontend **#7 dan #14**. Farel dan Andi melanjutkan **#10** dan bagian kelas pada **#15**.
- Setiap pemilik memperbarui kontrak, docs, dan tes unit/integrasi modulnya. Salim memimpin verifikasi lintas peran; QA bukan satu-satunya penulis seluruh tes.
- Keputusan OPEN tetap mengikuti pemilik PO/Curriculum/Data/Software/QA yang tercatat. Penugasan progress ini tidak mengonfirmasi pemilik hosting/domain staging atau menutup dependensi staging di bagian berikut.

## Ownership principles

- Ownership means first reviewer/coordination responsibility, not exclusive permission to edit code.
- Cross-cutting changes (auth, database schema, contracts, CI) require coordination beyond one feature owner.
- A feature spanning Frontend and Backend should have a named reviewer from both affected sides when possible.
- QA should review acceptance/testability early, not only after implementation.
- Product rule changes require PO/PM approval regardless of code ownership.

## Tentative staging ownership

As of 28 September 2026, the coordinator expects DevOps to handle the staging domain and the Database team to prepare Supabase/Google OAuth, but these assignments have **not been confirmed**. The **team will decide together** which staging hosting provider to use and who is accountable for its setup. The monthly budget for hosting and supporting services is **not set yet**. Record the team's provider, budget, and confirmed assignments here before relying on them for the 12 October target.

## CODEOWNERS

**ENGINEERING DECISION — requested by the coordinator on 1 October 2026:** [`.github/CODEOWNERS`](../../.github/CODEOWNERS) assigns all repository paths exclusively to `@splakplutoy` and `@ayiinee`. The approved progress assignments above govern current feature coordination; the original job-list remains historical context. Granting write access to another contributor does not add them as a code owner. A planned path does not mean its feature already exists. Use [PROJECT_STRUCTURE](PROJECT_STRUCTURE.md) for code placement.

CODEOWNERS requests reviews; it does not reserve files for specific contributors or grant repository access. When a rule lists multiple accounts, GitHub accepts approval from any one listed code owner if code-owner review is required. Request additional Frontend, Backend, or QA reviewers manually when a change needs cross-discipline review. Confirm each listed account has repository write access and configure the `main` branch review rule before relying on automatic requests.

## Penyesuaian scope PRD fitur — 2 Oktober 2026

Ownership engineering di atas tetap dicatat; [Drill v1.2 / TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md) tidak otomatis merubah pembagian anggota. Pekerjaan #3 pipeline Admin adalah kapabilitas operasional yang telah direncanakan, berada di luar scope journey kedua PRD fitur; Curriculum tetap pemasok/reviewer konten. #6 memerlukan formula XP terbaru yang TBC; #7 seluruh mapping Pretest TBC; #8 wajib gratis semua siswa, 35 PG/PGK MCMA/Category, countdown/auto-submit dan delayed immutable result; #9 memerlukan batch/scale/model/release sesuai SLA. Bedakan owner keputusan Product/Curriculum/Data dari pelaksana Software.
