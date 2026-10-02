const problems = [];
if (process.env.NODE_ENV !== 'test') problems.push('NODE_ENV must be test');
for (const [name, protocols] of [
  ['TEST_DATABASE_URL', ['postgres:', 'postgresql:']],
  ['TEST_REDIS_URL', ['redis:', 'rediss:']],
]) {
  try {
    const url = new URL(process.env[name] ?? '');
    if (!protocols.includes(url.protocol) || !['localhost', '127.0.0.1'].includes(url.hostname)) {
      problems.push(`${name} must point to a dedicated localhost test service`);
    }
    if (name === 'TEST_DATABASE_URL' && !/^\/numora_test(?:_[a-z0-9_]+)?$/.test(url.pathname)) {
      problems.push('TEST_DATABASE_URL must use a numora_test database');
    }
  } catch {
    problems.push(`${name} is missing or invalid`);
  }
}
if (!process.env.BULLMQ_PREFIX?.startsWith('numora:test:')) {
  problems.push('BULLMQ_PREFIX must start with numora:test:');
}
for (const name of ['DATABASE_URL', 'REDIS_URL']) {
  if (process.env[name]) problems.push(`Clear ${name}; local tests use TEST_* URLs only`);
}
if (
  process.env.DATABASE_MIGRATION_URL &&
  process.env.DATABASE_MIGRATION_URL !== process.env.TEST_DATABASE_URL
) {
  problems.push('DATABASE_MIGRATION_URL must exactly match TEST_DATABASE_URL or be empty');
}
if (problems.length) {
  for (const problem of problems) console.error(`Test environment: ${problem}`);
  process.exitCode = 1;
} else {
  console.log('Local test services are isolated from cloud development.');
}
