import { execFileSync } from 'node:child_process';

// This harness must never seed a shared Development/Staging/production database.
export function requireIsolatedServices(env = process.env) {
  for (const [key, protocol] of [
    ['TEST_DATABASE_URL', 'postgres:'],
    ['TEST_REDIS_URL', 'redis:'],
  ]) {
    let url;
    try {
      url = new URL(env[key]);
    } catch {
      throw new Error(`${key} is required.`);
    }
    if (
      !['localhost', '127.0.0.1'].includes(url.hostname) ||
      ![protocol, ...(protocol === 'postgres:' ? ['postgresql:'] : [])].includes(url.protocol)
    ) {
      throw new Error(`${key} must point to a local isolated test service.`);
    }
    if (
      key === 'TEST_DATABASE_URL' &&
      (!/^\/numora_test_job06(?:_[a-z0-9]+)?$/.test(url.pathname) ||
        url.searchParams.get('sslmode') !== 'disable')
    ) {
      throw new Error('JOB-06 requires its own numora_test_job06 database with sslmode=disable.');
    }
  }
}

export function releaseSha(cwd) {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
  if (execFileSync('git', ['status', '--porcelain'], { cwd, encoding: 'utf8' }).trim()) {
    throw new Error('Commit all changes before collecting release-chain evidence.');
  }
  if (process.env.RELEASE_SHA && process.env.RELEASE_SHA !== sha) {
    throw new Error('RELEASE_SHA does not match the checked-out commit.');
  }
  return sha;
}
