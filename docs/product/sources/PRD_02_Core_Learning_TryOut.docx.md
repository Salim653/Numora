**NUMORA**

**CORE LEARNING**

**PRODUCT REQUIREMENTS DOCUMENT (PRD)**

Feature Specification: TryOut Module (Simulasi TKA)

| Version 1.1 — Revised / Implementation Ready Dokumen ini merupakan revisi terhadap PRD TryOut v1.0 yang diberikan. Perbaikan difokuskan pada konsistensi requirement, pemisahan page/component/state, single-attempt lifecycle, countdown \+ auto-submit, delayed IRT result, scoring/XP, historical package behavior, error handling, analytics, dan acceptance criteria. |
| :---- |

| Attribute | Specification |
| :---- | :---- |
| Product | NUMORA — Sistem Drill & Practice untuk Tes Kemampuan Akademik Siswa SMP |
| Module | Core Learning |
| Feature | TryOut Module — Simulasi TKA |
| Platform | Web Application |
| Primary User | Siswa |
| Scope | Student Side |
| MVP Access | Semua user dapat mengerjakan TryOut secara gratis |
| Content | Paket soal dari Curriculum; bukan CRUD oleh Admin pada feature ini |
| Configuration | Rule/parameter yang belum memiliki UI dikelola sesuai keputusan hardcode MVP |
| Baseline | PRD TryOut Module v1.0 \+ keputusan implementasi terbaru dari tim |

| Source-of-truth rule Jika requirement di dokumen v1.0 bertentangan dengan keputusan MVP terbaru yang sudah disepakati tim, dokumen ini menggunakan keputusan terbaru dan mencatat konflik tersebut di Decision Log. Angka/formula yang belum ditetapkan tidak dibuat-buat; ditandai TBC/Dependency. |
| :---- |

# **1\. Feature Overview**

TryOut adalah fitur simulasi asesmen TKA Matematika SMP. Berbeda dari Drill yang berfungsi sebagai latihan bertingkat, TryOut berfungsi sebagai simulasi ujian dengan satu paket soal yang sama untuk seluruh user pada periode/batch yang sama, batas waktu countdown, single attempt, dan penilaian berbasis pembobotan IRT. Hasil final tidak langsung ditampilkan setelah submit; sistem menunggu proses batch dan perhitungan IRT.

| Aspect | Requirement |
| :---- | :---- |
| Objective | Mengukur kemampuan siswa secara menyeluruh melalui simulasi asesmen. |
| Output | Nilai hasil simulasi dan pembahasan soal. |
| Scoring | Pembobotan IRT; skala hasil mengikuti skala TKA yang menjadi acuan Curriculum/Research. |
| Question count | 35 soal untuk MVP, mengikuti keputusan feature terbaru dan target format simulasi TKA. |
| Question format | PG, PGK MCMA, dan PGK Kategori. |
| Timer | Countdown; tidak dapat dipause; mencapai 0 → auto-submit. |
| Attempt | Satu paket hanya dapat dikerjakan satu kali per user. |
| Result | Tersedia maksimal 3×24 jam setelah batch/periode TryOut berakhir dan proses IRT selesai. |
| Consistency | Setelah hasil dirilis, nilai paket tersebut tidak berubah. |
| XP | TryOut menghasilkan XP berdasarkan skor; tidak ada speed bonus/bonus tambahan dari durasi. |

# **2\. Scope & Out of Scope**

| Area | Included | Excluded / Not in MVP |
| :---- | :---- | :---- |
| Student | Melihat paket, detail, tutorial, rules, mengerjakan, submit/auto-submit, menunggu hasil, melihat hasil dan pembahasan. | Pengaturan TryOut oleh siswa. |
| Access | Semua user gratis pada MVP. | Payment flow aktif pada MVP. |
| Content | Paket TryOut yang disediakan Curriculum. | CRUD soal/paket melalui Admin UI dalam feature ini. |
| Configuration | Rule yang sudah ditetapkan dan parameter hardcode untuk MVP. | Admin configuration UI untuk rule TryOut. |
| Assessment | IRT weighted scoring dan hasil simulasi. | Klaim bahwa hasil merupakan nilai TKA resmi. |
| History | Paket ongoing dan paket lampau dapat dilihat sesuai access state. | Re-attempt paket yang sudah pernah dikerjakan. |

| Important correction from v1.0 Versi v1.0 menuliskan “Old package not completed → dapat membeli/membayar”, tetapi pada baris MVP juga menyatakan semua user gratis. Untuk MVP, payment flow tidak aktif. Oleh karena itu, paket lama yang belum pernah dikerjakan dapat tetap ditampilkan dan behavior pengerjaannya mengikuti access policy MVP yang sudah disepakati; tidak ada checkout/payment UI. Jika policy produk diubah pada fase berikutnya, payment menjadi feature terpisah. |
| :---- |

# **3\. User Flow & Information Architecture**

| Primary flow Dashboard → Menu TryOut → Ongoing / Past TryOut → TryOut Detail → Tutorial & Rules → Start → TryOut Attempt → Manual Submit atau Auto-submit → Submission Success → Processing / Waiting → Result Released → Nilai \+ Pembahasan. |
| :---- |

| Step | Page / State | User action | System behavior |
| :---- | :---- | :---- | :---- |
| 1 | TryOut Listing | Membuka menu TryOut | Memuat paket ongoing dan paket lampau. |
| 2 | TryOut Detail | Memilih paket | Menampilkan detail, tutorial, rules, periode/deadline, dan CTA. |
| 3 | Pre-start | Menekan Mulai | Validasi eligibility; bila valid, buat attempt tunggal dan mulai timer. |
| 4 | Attempt | Menjawab soal | Satu soal per tampilan; jawaban dapat diubah sebelum submit. |
| 5A | Manual Submit | Menekan Submit | Muncul confirmation; setelah confirm, jawaban final. |
| 5B | Auto-submit | Timer mencapai 0 | Sistem melakukan final submission otomatis. |
| 6 | Submission Success | Menunggu | Attempt berstatus submitted; hasil belum tersedia. |
| 7 | Processing | Membuka status hasil | Menampilkan bahwa hasil menunggu batch selesai \+ IRT. |
| 8 | Result Released | Membuka hasil | Nilai dan pembahasan tersedia. |

# **4\. Page & Component Specification — Listing**

## **TryOut Listing**

| Field | Specification |
| :---- | :---- |
| Tipe | PAGE |
| Status | WAJIB — MVP |
| Tujuan | Entry point untuk seluruh paket TryOut. |
| Isi / data | Section Ongoing TryOut; section/tab Past TryOut; status attempt; nama paket; periode; deadline; jumlah soal; CTA. |
| Interaction / behavior | User membuka menu → system load package metadata → tampilkan paket yang eligible. |
| State yang wajib didesain | Ongoing package dapat dikerjakan langsung. Paket lampau tetap dapat dilihat. Paket yang sudah pernah dikerjakan tidak boleh memiliki CTA re-attempt. |
| Business rules / constraint | Package metadata dari Curriculum/Software. |
| Dependency / catatan | — |

## **Ongoing TryOut**

| Field | Specification |
| :---- | :---- |
| Tipe | SECTION / COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Memprioritaskan paket yang sedang aktif. |
| Isi / data | Nama paket, periode, deadline dengan format “X hari lagi” atau “Berakhir pada …”, jumlah soal 35, status user, CTA. |
| Interaction / behavior | Not started → Mulai; in progress bila behavior resume diaktifkan → Continue/Resume; completed → Lihat hasil/processing. |
| State yang wajib didesain | Tidak boleh menampilkan paket sebagai ongoing setelah periode berakhir. |
| Business rules / constraint | Batch/period configuration. |
| Dependency / catatan | — |

## **Past TryOut**

| Field | Specification |
| :---- | :---- |
| Tipe | SECTION / COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Memungkinkan siswa melihat paket yang sudah lampau. |
| Isi / data | Nama paket, periode, status pernah/belum mengerjakan, result status, CTA. |
| Interaction / behavior | Never attempted; attempted/processing; attempted/result available. |
| State yang wajib didesain | Past package bukan berarti otomatis dapat dikerjakan ulang. Single-attempt rule tetap berlaku. |
| Business rules / constraint | Access policy MVP. |
| Dependency / catatan | — |

## **Past TryOut — Already Attempted**

| Field | Specification |
| :---- | :---- |
| Tipe | STATE |
| Status | WAJIB — CONDITIONAL |
| Tujuan | Mencegah user mengerjakan ulang paket yang sudah pernah disubmit. |
| Isi / data | Status completed/submitted; result processing atau available; CTA Lihat Hasil/Pembahasan jika tersedia. |
| Interaction / behavior | Processing; result available; expired/archived. |
| State yang wajib didesain | Satu paket \= satu attempt per user. |
| Business rules / constraint | TRY-AC single attempt. |
| Dependency / catatan | — |

## **Past TryOut — Never Attempted**

| Field | Specification |
| :---- | :---- |
| Tipe | STATE |
| Status | WAJIB — CONDITIONAL |
| Tujuan | Menentukan behavior paket lampau yang belum pernah dikerjakan. |
| Isi / data | Status never attempted dan CTA sesuai policy MVP. |
| Interaction / behavior | Eligible; unavailable; expired. |
| State yang wajib didesain | Pada MVP tidak ada payment UI. Jika paket lama boleh dikerjakan, tetap hanya satu attempt. |
| Business rules / constraint | Latest MVP access decision; future payment out of scope. |
| Dependency / catatan | — |

# **5\. Page & Component Specification — TryOut Detail**

## **TryOut Detail**

| Field | Specification |
| :---- | :---- |
| Tipe | PAGE |
| Status | WAJIB — MVP |
| Tujuan | Memberi seluruh informasi yang dibutuhkan sebelum siswa memulai ujian. |
| Isi / data | Nama paket; periode; deadline; jumlah soal 35; format soal; durasi; tutorial; rules; CTA Mulai. |
| Interaction / behavior | Available; already attempted; result processing; result available; unavailable/expired. |
| State yang wajib didesain | CTA Mulai hanya tersedia jika user eligible dan belum pernah mengerjakan paket tersebut. |
| Business rules / constraint | Durasi final mengikuti spesifikasi TKA/Curriculum bila belum dikunci di feature PRD. |
| Dependency / catatan | — |

## **Tutorial**

| Field | Specification |
| :---- | :---- |
| Tipe | SECTION / COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Membiasakan siswa dengan mekanisme pengerjaan. |
| Isi / data | Cara memilih jawaban, navigasi antar soal, arti status jawaban, format PG/PGK MCMA/PGK Kategori, dan cara submit. |
| Interaction / behavior | Expanded/read; scroll completion bila diperlukan. |
| State yang wajib didesain | Tutorial harus konsisten dengan behavior actual Attempt. |
| Business rules / constraint | Research & Curriculum. |
| Dependency / catatan | — |

## **Rules**

| Field | Specification |
| :---- | :---- |
| Tipe | SECTION / COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Menjelaskan aturan yang berdampak pada hasil dan tidak dapat dibatalkan. |
| Isi / data | 35 soal; countdown; timer tidak pause; auto-submit saat waktu habis; satu kali pengerjaan; hasil menunggu batch/IRT; pembahasan setelah hasil rilis. |
| Interaction / behavior | Read; acknowledgement/start. |
| State yang wajib didesain | Rules harus diketahui sebelum CTA Start; jangan mengandalkan informasi tersembunyi saat ujian. |
| Business rules / constraint | Product/Research. |
| Dependency / catatan | — |

## **Start Validation**

| Field | Specification |
| :---- | :---- |
| Tipe | BEHAVIOR / STATE |
| Status | WAJIB — STATE |
| Tujuan | Memastikan attempt dapat dibuat secara valid sebelum timer dimulai. |
| Isi / data | Eligibility, package status, existing attempt status. |
| Interaction / behavior | Eligible; already attempted; package expired; system error. |
| State yang wajib didesain | Timer dimulai hanya ketika attempt valid berhasil dibuat. |
| Business rules / constraint | Backend transaction \+ server time. |
| Dependency / catatan | — |

# **6\. Page & Component Specification — TryOut Attempt**

## **TryOut Attempt**

| Field | Specification |
| :---- | :---- |
| Tipe | PAGE |
| Status | WAJIB — MVP |
| Tujuan | Halaman utama pengerjaan 35 soal. |
| Isi / data | Satu soal per tampilan; nomor soal; question navigator; opsi jawaban; countdown timer; Submit. |
| Interaction / behavior | Initial; answering; answered; unanswered; submitting; submitted; timer expired; connection issue. |
| State yang wajib didesain | Jawaban dapat diubah sebelum submit. Setelah final submission, jawaban tidak dapat diubah. |
| Business rules / constraint | Question bank / package snapshot. |
| Dependency / catatan | — |

## **Question Display**

| Field | Specification |
| :---- | :---- |
| Tipe | COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Menampilkan satu soal dan seluruh opsi yang relevan. |
| Isi / data | Stem, image/table bila soal membutuhkan, options, format indicator bila diperlukan. |
| Interaction / behavior | Loading; loaded; malformed/error content. |
| State yang wajib didesain | Soal yang ditampilkan berasal dari paket TryOut yang sama untuk seluruh user pada periode/batch yang sama. |
| Business rules / constraint | Curriculum content. |
| Dependency / catatan | — |

## **Question Navigator**

| Field | Specification |
| :---- | :---- |
| Tipe | COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Memungkinkan siswa berpindah antar 35 soal. |
| Isi / data | Nomor soal, current, answered/unanswered, dan navigation control. |
| Interaction / behavior | Current; answered; unanswered; disabled saat final submit. |
| State yang wajib didesain | Navigation tidak mengubah jawaban yang sudah dipilih; jawaban tetap dapat diubah selama attempt belum final. |
| Business rules / constraint | UI/UX shared pattern. |
| Dependency / catatan | — |

## **Answer State**

| Field | Specification |
| :---- | :---- |
| Tipe | STATE |
| Status | WAJIB — STATE |
| Tujuan | Menunjukkan pilihan siswa pada setiap soal. |
| Isi / data | Selected/unselected; answered/unanswered. |
| Interaction / behavior | Selected; changed; unanswered; saved/persisted bila mekanisme autosave diterapkan. |
| State yang wajib didesain | Jawaban dapat diubah sampai final submit. |
| Business rules / constraint | Exact persistence mechanism must be defined by Software. |
| Dependency / catatan | — |

## **Countdown Timer**

| Field | Specification |
| :---- | :---- |
| Tipe | COMPONENT |
| Status | WAJIB — MVP |
| Tujuan | Membatasi durasi pengerjaan sesuai simulasi ujian. |
| Isi / data | Remaining time. |
| Interaction / behavior | Normal; warning; critical; 0; submitting. |
| State yang wajib didesain | Timer countdown, tidak dapat dipause. Ketika mencapai 0 → auto-submit. Durasi final harus mengikuti spesifikasi yang disetujui. |
| Business rules / constraint | Official TKA duration / Curriculum; server authoritative time recommended. |
| Dependency / catatan | — |

## **Submit Confirmation**

| Field | Specification |
| :---- | :---- |
| Tipe | MODAL |
| Status | WAJIB — MODAL |
| Tujuan | Mencegah siswa melakukan final submit secara tidak sengaja. |
| Isi / data | Jumlah soal terjawab/belum terjawab; warning bahwa submission final; Cancel; Submit. |
| Interaction / behavior | Open; cancel; confirm; submission in progress. |
| State yang wajib didesain | Setelah confirm, tidak ada perubahan jawaban. |
| Business rules / constraint | Duplicate submission prevention. |
| Dependency / catatan | — |

## **Auto-submit**

| Field | Specification |
| :---- | :---- |
| Tipe | STATE / BEHAVIOR |
| Status | WAJIB — STATE |
| Tujuan | Menutup attempt otomatis ketika waktu habis. |
| Isi / data | Timer reaches zero → submitting indicator → submission success/processing. |
| Interaction / behavior | Timer warning; expired; submitting; success; error. |
| State yang wajib didesain | Auto-submit tidak membutuhkan confirmation modal karena trigger berasal dari timer. Sistem harus menghasilkan satu final submission. |
| Business rules / constraint | Server-side timer and idempotency. |
| Dependency / catatan | — |

# **7\. Submission, Processing & Result Lifecycle**

## **Submission Success**

| Field | Specification |
| :---- | :---- |
| Tipe | SCREEN / STATE |
| Status | WAJIB — STATE |
| Tujuan | Memberikan kepastian bahwa jawaban telah diterima. |
| Isi / data | Success status, package name, submitted time, status “Hasil sedang diproses”, CTA kembali ke TryOut/lihat status. |
| Interaction / behavior | Submitting; success; failed submission; retry policy. |
| State yang wajib didesain | Jangan menampilkan score final pada tahap ini karena IRT belum selesai. |
| Business rules / constraint | TRY-AC4/5; backend submission. |
| Dependency / catatan | — |

## **Result Processing / Waiting**

| Field | Specification |
| :---- | :---- |
| Tipe | PAGE / STATE |
| Status | WAJIB — MVP |
| Tujuan | Menjelaskan kenapa hasil belum dapat dilihat. |
| Isi / data | Package name; submission status; batch end date/time; statement hasil tersedia maksimal 3×24 jam setelah batch berakhir; processing indicator. |
| Interaction / behavior | Waiting for batch end; IRT processing; result released; delayed/error. |
| State yang wajib didesain | Result dan pembahasan terkunci sampai hasil dirilis. |
| Business rules / constraint | IRT pipeline \+ batch scheduler. |
| Dependency / catatan | — |

## **Result Released**

| Field | Specification |
| :---- | :---- |
| Tipe | STATE |
| Status | WAJIB — CONDITIONAL |
| Tujuan | Menandai bahwa nilai final sudah tersedia. |
| Isi / data | Result status, score, CTA hasil/pembahasan. |
| Interaction / behavior | Available; error loading. |
| State yang wajib didesain | Setelah release, score tidak berubah. |
| Business rules / constraint | IRT output snapshot. |
| Dependency / catatan | — |

## **TryOut Result**

| Field | Specification |
| :---- | :---- |
| Tipe | PAGE |
| Status | WAJIB — CONDITIONAL |
| Tujuan | Menampilkan hasil final simulasi. |
| Isi / data | Nilai; informasi paket; score summary; XP; CTA pembahasan. |
| Interaction / behavior | Loading; available; error. |
| State yang wajib didesain | Nilai adalah hasil simulasi platform dengan IRT weighted scoring; jangan diberi label sebagai nilai TKA resmi. |
| Business rules / constraint | IRT \+ score snapshot. |
| Dependency / catatan | — |

## **Pembahasan TryOut**

| Field | Specification |
| :---- | :---- |
| Tipe | PAGE / SECTION |
| Status | WAJIB — CONDITIONAL |
| Tujuan | Memberikan pembahasan setelah result tersedia. |
| Isi / data | Soal, jawaban siswa, jawaban benar/ketentuan scoring, pembahasan. |
| Interaction / behavior | Locked before result; available after result; error. |
| State yang wajib didesain | Pembahasan tidak tersedia sebelum hasil IRT dirilis. |
| Business rules / constraint | Content explanation from Curriculum. |
| Dependency / catatan | — |

# **8\. Assessment & Scoring Rules**

| Aspect | Rule | Status |
| :---- | :---- | :---- |
| Question count | 35 soal per package. | FINAL — MVP |
| Formats | PG; PGK MCMA; PGK Kategori. | FINAL — MVP |
| Scoring method | Pembobotan IRT. | FINAL — MVP |
| Scale | Mengikuti skala TKA yang disetujui Research/Curriculum. | DEPENDENCY |
| Raw score | Jawaban siswa menjadi input perhitungan hasil. | FINAL |
| IRT calibration | Dilakukan pada batch/package sesuai pipeline Data & AI. | DEPENDENCY |
| Result availability | Maksimal 3×24 jam setelah batch/periode berakhir. | FINAL — PRODUCT RULE |
| Result immutability | Setelah result released, nilai tidak berubah. | FINAL |
| Question package | Semua user pada periode/batch yang sama mengerjakan package yang sama. | FINAL |
| Attempt | Satu package satu kali per user. | FINAL |

| IRT boundary PRD feature tidak perlu mendefinisikan rumus statistik IRT secara matematis. PRD cukup mendefinisikan input/output dan timing. Data & AI bertanggung jawab terhadap implementasi parameter/calibration IRT; Product \+ Research/Curriculum bertanggung jawab memastikan skala dan interpretasi output sesuai keputusan produk. |
| :---- |

# **9\. XP & Activity Contribution**

## **XP TryOut**

| Field | Specification |
| :---- | :---- |
| Tipe | COMPONENT / RESULT DATA |
| Status | WAJIB — MVP |
| Tujuan | Memberikan activity XP setelah TryOut selesai dan hasil tersedia sesuai mekanisme product. |
| Isi / data | XP earned pada result; bila dibutuhkan total XP di profile/dashboard. |
| Interaction / behavior | Pending; calculated; displayed; error. |
| State yang wajib didesain | XP didasarkan pada skor TryOut dan tidak memperoleh speed bonus atau bonus durasi. |
| Business rules / constraint | Exact score→XP conversion must be frozen by Product/Data before implementation. |
| Dependency / catatan | — |

## **XP Formula**

| Field | Specification |
| :---- | :---- |
| Tipe | BUSINESS RULE |
| Status | TBC — MUST FREEZE BEFORE DEV |
| Tujuan | Menentukan konversi score menjadi XP secara deterministik. |
| Isi / data | Minimal input: final TryOut score. Output: XP. |
| Interaction / behavior | Not calculated; calculated; invalid score. |
| State yang wajib didesain | Tidak boleh ada bonus dari waktu, retry, atau faktor lain jika keputusan final adalah “berdasarkan skor tanpa bonus”. |
| Business rules / constraint | Product \+ Data. |
| Dependency / catatan | — |

| Recommended deterministic rule Jika tim ingin formula paling sederhana untuk MVP, gunakan XP \= final score (misalnya score 0–100 → 0–100 XP). Namun angka ini adalah rekomendasi implementasi, bukan fakta dari dokumen sumber; Product/Data harus mengonfirmasi sebelum dimasukkan sebagai acceptance criteria final. |
| :---- |

# **10\. History & Package Lifecycle**

| State | User access | Expected UI |
| :---- | :---- | :---- |
| Ongoing — Not Started | Start allowed. | Mulai |
| Ongoing — Submitted | No re-attempt. | Processing / Lihat Status |
| Past — Never Attempted | View package; execution follows MVP access policy. | Mulai jika eligible; tidak ada payment UI pada MVP. |
| Past — Already Attempted \+ Processing | No re-attempt. | Menunggu hasil |
| Past — Already Attempted \+ Result Released | No re-attempt; result/explanation accessible. | Lihat Hasil / Pembahasan |
| Expired / Unavailable | No new attempt. | Informational state \+ Back |

| Single-attempt invariant Sistem harus memeriksa existing attempt di server sebelum membuat attempt baru. Refresh, double-click, back-forward navigation, retry request, atau membuka URL secara langsung tidak boleh menghasilkan attempt kedua. |
| :---- |

# **11\. Error Handling & Resilience**

| Scenario | Expected behavior | Status |
| :---- | :---- | :---- |
| Internet issue during attempt | Pertahankan state lokal/session sesuai mekanisme persistence yang disepakati; tampilkan connection warning; jangan mengubah final result. | WAJIB |
| Refresh during attempt | Tampilkan warning risiko progres; behavior resume harus konsisten dengan persistence strategy. | WAJIB |
| Refresh after submit | Tidak membuat submission kedua; tampilkan submitted/processing state. | WAJIB |
| Timer reaches 0 | Auto-submit; user tidak perlu confirmation. | WAJIB |
| Double submit | Idempotent; hanya satu final attempt/result. | WAJIB |
| Result service delayed | Tetap tampilkan processing; jangan tampilkan nilai parsial. | WAJIB |
| IRT failure | Tampilkan status error/processing dan jangan mengubah raw submission; retry processing di backend. | WAJIB |
| Package expired before Start | Prevent start dan tampilkan package unavailable/expired. | WAJIB |
| Package already attempted | Prevent new attempt. | WAJIB |
| Content load error | Error state \+ retry/back navigation. | WAJIB |
| Session expired | User diarahkan login; jangan membuat duplicate attempt setelah re-auth. | WAJIB |

| Open implementation point Versi sumber menyebut “penyimpanan sesi seperti Drill” tetapi tidak menentukan apakah autosave ke server, local/session storage, atau kombinasi. Ini harus ditentukan Software karena berdampak langsung pada resume, timer integrity, dan data loss. |
| :---- |

# **12\. Analytics Event**

| Event | Trigger | Recommended payload | Priority |
| :---- | :---- | :---- | :---- |
| tryout\_opened | User membuka menu TryOut. | user\_id, timestamp | P0 |
| tryout\_detail\_viewed | User membuka detail package. | package\_id, period\_id | P0 |
| tryout\_started | Attempt berhasil dibuat dan timer dimulai. | package\_id, attempt\_id, timestamp | P0 |
| question\_answered | User memilih/mengubah jawaban. | package\_id, attempt\_id, question\_id, format, timestamp | P0 |
| tryout\_submitted | Manual submit confirmed atau auto-submit. | package\_id, attempt\_id, submission\_type, answered\_count, timestamp | P0 |
| tryout\_processing\_viewed | User membuka status processing. | package\_id, attempt\_id | P1 |
| result\_viewed | User membuka result. | package\_id, attempt\_id, score | P0 |
| explanation\_viewed | User membuka pembahasan. | package\_id, attempt\_id, question\_id optional | P1 |
| tryout\_abandoned | User leaves active attempt without submit, bila tracking didukung. | package\_id, attempt\_id, last\_question, elapsed\_time | P1 |

# **13\. UI/UX Inventory — Page, Component, Modal & State**

| No | Artefact | Type | Status | Key content/state |
| :---- | :---- | :---- | :---- | :---- |
| 1 | TryOut Listing | PAGE | WAJIB | Ongoing, Past, package cards, status, deadline |
| 2 | Ongoing TryOut | SECTION | WAJIB | Active package, deadline, 35 questions, CTA |
| 3 | Past TryOut | SECTION | WAJIB | Historical package list |
| 4 | TryOut Card | COMPONENT | WAJIB | Package identity, period, status, CTA |
| 5 | Never Attempted State | STATE | WAJIB-CONDITIONAL | Eligible to start under MVP policy |
| 6 | Already Attempted State | STATE | WAJIB-CONDITIONAL | Processing/result, no re-attempt |
| 7 | TryOut Detail | PAGE | WAJIB | Package info, duration, deadline, CTA |
| 8 | Tutorial | SECTION | WAJIB | How to answer/navigate |
| 9 | Rules | SECTION | WAJIB | Timer, single attempt, auto-submit, result delay |
| 10 | Start Validation | STATE | WAJIB | Eligibility check |
| 11 | TryOut Attempt | PAGE | WAJIB | Question, options, navigator, timer, submit |
| 12 | Question Navigator | COMPONENT | WAJIB | 35 question states |
| 13 | Answer State | STATE | WAJIB | Selected/unanswered/changed |
| 14 | Countdown Timer | COMPONENT | WAJIB | Remaining time/warning/expired |
| 15 | Submit Confirmation | MODAL | WAJIB | Answered count \+ final warning |
| 16 | Auto-submit | STATE | WAJIB | Timer zero → submission |
| 17 | Submission Success | STATE | WAJIB | Submitted/processing |
| 18 | Processing/Waiting | PAGE/STATE | WAJIB | Batch \+ IRT waiting |
| 19 | Result Released | STATE | WAJIB-CONDITIONAL | Result available |
| 20 | TryOut Result | PAGE | WAJIB-CONDITIONAL | Score, XP, explanation CTA |
| 21 | TryOut Explanation | PAGE/SECTION | WAJIB-CONDITIONAL | Answer \+ explanation |
| 22 | Expired/Unavailable | STATE | WAJIB | No start allowed |
| 23 | Error Load | STATE | WAJIB | Retry/back |
| 24 | Session Expired | STATE | WAJIB | Re-authentication |

# **14\. Acceptance Criteria**

| ID | Acceptance Criteria |
| :---- | :---- |
| TRY-AC01 | User dapat melihat TryOut ongoing pada menu TryOut. |
| TRY-AC02 | User dapat melihat paket TryOut lampau beserta status pernah/belum mengerjakan. |
| TRY-AC03 | Semua user pada periode/batch yang sama menerima paket soal yang sama. |
| TRY-AC04 | Satu package hanya dapat memiliki satu final attempt per user. |
| TRY-AC05 | TryOut terdiri dari 35 soal untuk MVP. |
| TRY-AC06 | Format soal yang didukung adalah PG, PGK MCMA, dan PGK Kategori. |
| TRY-AC07 | Soal ditampilkan satu per satu dan user dapat berpindah antar soal. |
| TRY-AC08 | Jawaban dapat diubah selama attempt belum final. |
| TRY-AC09 | Timer berupa countdown dan tidak dapat dipause. |
| TRY-AC10 | Saat countdown mencapai 0, sistem melakukan auto-submit. |
| TRY-AC11 | Manual submit menampilkan confirmation modal sebelum final submission. |
| TRY-AC12 | Manual submit dan auto-submit menghasilkan satu submission final yang idempotent. |
| TRY-AC13 | Setelah submission final, user tidak dapat mengubah jawaban. |
| TRY-AC14 | Setelah submit, user melihat status processing dan bukan nilai final. |
| TRY-AC15 | Hasil tersedia maksimal 3×24 jam setelah batch/periode TryOut berakhir, sesuai keberhasilan pipeline IRT. |
| TRY-AC16 | Pembahasan terkunci sebelum result dirilis. |
| TRY-AC17 | Setelah result dirilis, nilai paket tidak berubah. |
| TRY-AC18 | Result menampilkan nilai hasil simulasi dan XP. |
| TRY-AC19 | XP TryOut dihitung berdasarkan skor dan tidak mendapat speed bonus atau bonus durasi. |
| TRY-AC20 | User yang sudah pernah mengerjakan paket tidak dapat mengerjakannya lagi. |
| TRY-AC21 | Refresh/double click/repeated request tidak membuat attempt atau result ganda. |
| TRY-AC22 | Paket expired/unavailable tidak dapat dimulai. |
| TRY-AC23 | Jika hasil belum tersedia, UI tetap menunjukkan processing/waiting tanpa menampilkan score parsial. |
| TRY-AC24 | TryOut result dibedakan dari nilai TKA resmi. |
| TRY-AC25 | MVP tidak menampilkan payment/checkout flow. |

# **15\. Dependency Matrix**

| Team | Dependency / Responsibility | Required before |
| :---- | :---- | :---- |
| Research & Curriculum | Spesifikasi format TKA, durasi, cakupan, bank soal, pembahasan, interpretasi skala hasil. | UI freeze \+ scoring validation |
| Product Owner | Package lifecycle, MVP access, single attempt, XP rule, result availability wording. | PRD freeze |
| UI/UX | Listing, Detail, Attempt, states, submit modal, processing, result, explanation, errors. | Development handoff |
| Software | Package delivery, attempt transaction, timer, submission idempotency, result status, access control. | Backend implementation |
| Data & AI | IRT calibration/calculation, score output, processing status, XP mapping if data-owned. | Result pipeline |
| Monitoring/Analytics | Event schema and activity tracking. | Analytics implementation |

# **16\. Decision Log & Remaining TBC**

| Topic | Current decision | Status / action |
| :---- | :---- | :---- |
| MVP access | Semua user gratis. | FINAL |
| Payment | Tidak ada payment UI/flow pada MVP. | FINAL — move to future feature |
| Question count | 35 soal. | FINAL — MVP |
| Formats | PG, PGK MCMA, PGK Kategori. | FINAL — MVP |
| Timer | Countdown, no pause, auto-submit at 0\. | FINAL |
| Attempt | 1 package \= 1 attempt/user. | FINAL |
| Package consistency | Same package for all users in same period/batch. | FINAL |
| Result timing | Max 3×24h after batch ends. | FINAL |
| Result immutability | Released score does not change. | FINAL |
| XP | Based on score, no time/speed bonus. | FINAL principle |
| XP exact formula | Exact score→XP mapping not specified in source. | TBC — freeze before dev |
| Duration | Feature PRD says duration exists but does not provide a numeric value. | TBC — Research/Curriculum |
| IRT formula | Method is IRT weighted scoring; statistical implementation not defined here. | Data-owned |
| TKA scale | Must follow verified TKA scale. | TBC — Research/Curriculum |
| Answer persistence | “Session storage like Drill” is referenced but implementation is not specified. | TBC — Software |
| Past never-attempted package | MVP has no payment. Whether past package remains executable is an access-policy decision. | TBC if not already frozen |
| Batch end | Result timing is relative to batch end. | TBC — exact schedule/config |

| Do not silently assume the TBC items UI/UX boleh mendesain state generik untuk TBC, tetapi angka/formula final tidak boleh di-hardcode oleh Software sebelum Product \+ Research/Curriculum/Data mengunci keputusan. Ini mencegah mismatch antara PRD, desain, backend, dan QA. |
| :---- |

# **17\. QA Test Matrix**

| Category | Test case | Expected result |
| :---- | :---- | :---- |
| Access | Open ongoing package | Detail and Start available if not attempted. |
| Access | Open already-attempted package | No re-attempt CTA; processing/result available. |
| Access | Open expired package | Start blocked. |
| Package | Two users in same batch | Both receive identical package. |
| Attempt | Start package twice by repeated request | Only one attempt exists. |
| Question | Answer and change answer | Latest answer retained until submit. |
| Navigation | Move between questions | Answer states retained. |
| Timer | Reach timer zero | Auto-submit occurs. |
| Timer | Try to pause | No pause control/behavior. |
| Submit | Click Submit | Confirmation modal shown. |
| Submit | Cancel confirmation | Return to attempt; no submission. |
| Submit | Confirm | Attempt finalized; answers locked. |
| Duplicate | Double click submit | One submission only. |
| Refresh | Refresh active attempt | Warning \+ behavior follows persistence policy. |
| Processing | Open result before release | Processing state; no score/explanation. |
| Result | After IRT release | Score and explanation available. |
| Result | Reopen released result | Score remains identical. |
| XP | Different scores | XP follows frozen score→XP mapping; no speed bonus. |
| Explanation | Open before result release | Blocked. |
| Analytics | Start/answer/submit/result | Required event recorded. |

# **18\. Final Specification Summary**

| Core lifecycle TryOut harus diperlakukan sebagai satu assessment lifecycle: PACKAGE → ELIGIBILITY → ATTEMPT → SUBMISSION → PROCESSING → IRT RESULT → EXPLANATION. Single-attempt dan idempotent submission merupakan invariant utama. |
| :---- |

| Difference from Drill Drill memberikan feedback langsung setelah submit, dapat diulang dengan variasi, menggunakan count-up untuk konteks dan speed bonus. TryOut menggunakan countdown, single attempt per package, paket yang sama untuk user dalam batch, hasil ditunda sampai batch \+ IRT, dan tidak memiliki speed bonus. |
| :---- |

| Handoff readiness Setelah TBC berikut dikunci — durasi TryOut, skala TKA, score→XP mapping, answer/session persistence, dan policy paket lampau yang belum pernah dikerjakan — dokumen ini dapat digunakan sebagai source of truth untuk UI/UX, Software, Data & AI, Monitoring, dan QA. |
| :---- |

# **19\. Revision Notes from v1.0**

| Area | v1.0 | v1.1 Revised |
| :---- | :---- | :---- |
| MVP access/payment | Mencampur “dapat membeli” dengan “semua user gratis”. | MVP gratis; payment out of scope dan tidak boleh muncul di UI. |
| Flow | Linear flow sederhana. | Ditambah state/branch untuk eligibility, manual/auto submit, processing, release. |
| Listing | Ongoing \+ past disebut. | Past/ongoing menjadi explicit section \+ attempt states. |
| Attempt | Soal satu per halaman. | Ditambah navigator, answer state, single-attempt invariant, idempotency. |
| Timer | Countdown \+ auto submit. | Ditambah warning/expired/submitting states dan server-time dependency. |
| Result | Menunggu IRT. | Diperjelas menjadi submission success → processing → release → result/explanation. |
| XP | Berdasarkan skor. | Ditegaskan no speed bonus; exact mapping ditandai TBC. |
| Error handling | Internet/refresh/timeout/duplicate. | Ditambah package expiry, session expiry, result delay, IRT failure, content load. |
| Analytics | 6 event. | Diperluas dengan detail view, processing view, abandonment. |
| Acceptance | 7 criteria. | 25 criteria yang mencakup lifecycle dan edge cases. |

