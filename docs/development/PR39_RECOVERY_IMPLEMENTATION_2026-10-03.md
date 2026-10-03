# Rekonsiliasi PR #39 — recovery akun QA

**ENGINEERING DECISION — implementasi yang diminta pengguna 3 Oktober 2026:** branch PR #39 direkonsiliasi dengan main `cc23428`, termasuk QA monitoring #38 dan ownership #37. Root package.json mempertahankan seluruh checks/release-chain main dan menambah alias rotasi; test:checks memasukkan regression script QA tanpa credential/environment nyata. Public Google login dan kebijakan produk tidak berubah.

## Perilaku

`create-qa-accounts.mjs` menjadi CLI kecil; `qa-accounts.mjs` menangani environment guard, validasi keenam akun, eksklusivitas proses, atomic write, journal candidate/confirmed dan resume. Sebelum remote mutation, semua akun divalidasi terhadap email fixture, UUID pinned, project exact dan metadata QA. File corrupt/unreadable tidak dianggap vault baru.

Active vault menyimpan password confirmed. Pending journal menyimpan snapshot awal, kandidat dan daftar konfirmasi. Remote success yang diikuti local write failure/ambiguous response dapat dilanjutkan dengan kandidat sama; tidak membuat set password baru pada retry. Seluruh file tetap ignored. Error provider/filesystem tidak dicetak mentah.

Default provisioning tetap idempotent dan tidak merotasi password. Existing QA Auth users tanpa vault memerlukan restore atau command rotasi eksplisit. Lock mencegah dua proses saling menimpa; hard-crash lock sengaja memerlukan verifikasi PID dan penghapusan hanya lock sebelum resume. Panduan: [QA_SEED](../testing/QA_SEED.md).

## Verifikasi

Regression memakai directory sementara dan Admin API mock: preflight/identity/project/corrupt/read failure, kegagalan akun tengah, ambiguous success, kegagalan atomic vault/journal/manifest, concurrent/stale lock, provisioning/rerun/recovery/missing vault, mode conflict dan arg/alias. CI menjalankannya di Validate contracts melalui test:checks. Gate lokal/CI terbaru dicatat pada PR; dokumen ini tidak mengklaim rotasi Supabase nyata, reviewer approval, Google/staging atau merge.

Lokal: `pnpm test:checks` 33/33 (22 recovery QA, 11 checks existing), lint, typecheck, contracts:validate, contracts:types:check dan build seluruh workspace lulus. JSON `null` pada vault maupun pending juga ditolak sebelum provider lookup.

CI [37101245019](https://github.com/ayiinee/Numora/actions/runs/37101245019) pada `ba9ec05` lulus seluruh gate termasuk PostgreSQL/Redis, browser, upgrade/bridge, connected release chain, build dan OpenAPI. Regression node:test dipindahkan ke `scripts/qa-accounts.test.mjs` agar tidak ditemukan ulang oleh Vitest. Setelah #40 merged, branch diselaraskan lagi dengan main `36b0f25`; gate gabungan wajib lulus sebelum merge #39.
