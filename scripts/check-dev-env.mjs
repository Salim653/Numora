const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'DATABASE_URL',
  'REDIS_URL',
  'BULLMQ_PREFIX',
];
const problems = required.filter((name) => !process.env[name]).map((name) => `${name} is missing`);

if (process.env.NEXT_PUBLIC_SUPABASE_URL !== process.env.SUPABASE_URL)
  problems.push('Web and API Supabase URLs differ');
if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY !== process.env.SUPABASE_PUBLISHABLE_KEY)
  problems.push('Web and API Supabase publishable keys differ');
if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
  problems.push('Remove NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; service-role keys must stay server-side');
if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('rediss://'))
  problems.push('REDIS_URL must use rediss://');
if (process.env.BULLMQ_PREFIX && !process.env.BULLMQ_PREFIX.startsWith('numora:dev:'))
  problems.push('BULLMQ_PREFIX must start with numora:dev:');
if (process.env.DATABASE_URL) {
  try {
    const mode = new URL(process.env.DATABASE_URL).searchParams.get('sslmode');
    if (mode !== 'require' && mode !== 'verify-full')
      problems.push('DATABASE_URL must set sslmode=require or sslmode=verify-full');
  } catch {
    problems.push('DATABASE_URL is not a valid URL');
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`Environment: ${problem}`);
  process.exitCode = 1;
} else {
  console.log('Development environment configuration is consistent.');
}
