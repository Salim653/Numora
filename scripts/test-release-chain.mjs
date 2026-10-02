import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { requireIsolatedServices, releaseSha } from '../apps/api/scripts/release-chain-guard.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
requireIsolatedServices();
const sha = releaseSha(root);
const env = {
  ...process.env,
  NODE_ENV: 'test',
  RELEASE_SHA: sha,
  DATABASE_URL: process.env.TEST_DATABASE_URL,
  DATABASE_MIGRATION_URL: process.env.TEST_DATABASE_URL,
};
for (const args of [
  ['--filter', '@tka/database', 'db:migrate'],
  ['--filter', '@tka/database', 'build'],
  ['--filter', '@tka/api', 'build'],
  ['--filter', '@tka/web', 'exec', 'playwright', 'test', '--config=playwright.connected.config.ts'],
]) {
  // All command arguments are constants; credentials travel only through child environment.
  const result = spawnSync('pnpm', args, {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
if (releaseSha(root) !== sha) throw new Error('Release SHA changed during testing.');
