import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    maxWorkers: 2,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/e2e-connected/**', '**/.next*/**'],
  },
});
