# Evidence rekonsiliasi PR #40

**ENGINEERING DECISION — QA fixture 3 Oktober 2026:** Playwright menjalankan create/edit/publish/archive paket Drill, resolve laporan, lalu membuka IRT SUCCEEDED tanpa waktu release, pada viewport 390 dan 1440 px. Request/method/body diperiksa dan tidak ada horizontal overflow. Seluruh identitas, data serta respons API adalah fixture lokal, tanpa Supabase/akun nyata.

- [Mobile 390 px](admin-content-390.png)
- [Desktop 1440 px](admin-content-1440.png)

Screenshot memperlihatkan tab IRT setelah lifecycle selesai; bukti ini tidak menyatakan hasil resmi dirilis atau menggantikan connected E2E dalam CI.
