# PR #18 — generated Next.js types

**ENGINEERING DECISION:** mengikuti dokumentasi Next.js yang terpasang (`next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`, bagian next-env.d.ts): file dibuat ulang oleh `next dev`, `next build`, dan `next typegen`; tidak diedit/dipertahankan sebagai sumber Git.

PR awal hanya mengganti `.next/types` menjadi `.next/dev/types`. Itu sesuai output development, tetapi build akan menggantinya kembali dan menyebabkan perubahan Git berulang.

Perbaikan:

- Lepaskan `apps/web/next-env.d.ts` dari index Git dengan `git rm --cached`; file lokal dipertahankan.
- Abaikan file generated tersebut dalam `.gitignore`; tsconfig tetap memuatnya, serta output type development dan production.
- Script typecheck web menjalankan `next typegen` sebelum `tsc --noEmit`, sehingga checkout bersih mendapat deklarasi Next dan route helpers tanpa harus memulai development server atau melakukan build terlebih dahulu.
- Branch PR disinkronkan dengan main `2d24d86` tanpa force push.

Tidak ada perubahan auth, API, schema, atau aturan produk. CI quality pada head terbaru harus lulus sebelum review approve/merge. Type generation/typecheck checkout bersih diuji dalam worktree sementara dengan dependencies terpasang yang sama, tanpa menyalin `.env` atau menimpa output server development pengguna.
