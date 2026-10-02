import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ref = 'pkamenfnwmoeisccnrnk';
const names = ['admin', 'teacherA', 'teacherB', 'studentA', 'studentB', 'studentC'];
const rotatePasswords = process.argv.includes('--rotate-passwords');
if (process.argv.slice(2).some((argument) => argument !== '--rotate-passwords')) {
  throw new Error('Only --rotate-passwords is supported.');
}
const root = resolve(import.meta.dirname, '../../..');
const vault = resolve(root, '.qa-seed');
const file = resolve(vault, 'accounts.json');
const manifestFile = resolve(vault, 'actors.json');

if (process.env.NODE_ENV !== 'development' ||
    process.env.SUPABASE_URL !== `https://${ref}.supabase.co` ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !== process.env.SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_REF !== ref ||
    !process.env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_')) {
  throw new Error('QA accounts require the exact Development project and server secret key.');
}

await mkdir(vault, { recursive: true });
const existing = await readFile(file, 'utf8').then(JSON.parse, () => null);
if (existing && (existing.projectRef !== ref || Object.keys(existing.accounts).sort().join() !== names.slice().sort().join())) {
  throw new Error('Existing QA account vault has an unexpected shape.');
}
const accounts = existing?.accounts ?? Object.fromEntries(names.map((name) => [name, {
  email: `numora-qa-${name.toLowerCase()}@example.invalid`,
  password: randomBytes(24).toString('base64url'),
  id: null,
}]));
if (rotatePasswords) {
  for (const name of names) accounts[name].password = randomBytes(24).toString('base64url');
}
const save = async () => writeFile(file, JSON.stringify({ projectRef: ref, accounts }, null, 2), { mode: 0o600 });
if (!existing || rotatePasswords) await save();

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { error: accessError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
if (accessError) throw new Error(`Admin API preflight failed: ${accessError.message}`);
let page = 1;
const existingUsers = [];
while (true) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw new Error(`Admin user lookup failed: ${error.message}`);
  existingUsers.push(...data.users);
  if (data.users.length < 100) break;
  page++;
}
for (const name of names) {
  const account = accounts[name];
  if (!account || typeof account.email !== 'string' || typeof account.password !== 'string')
    throw new Error('QA vault is invalid.');
  if (account.id) {
    const { data, error } = await admin.auth.admin.getUserById(account.id);
    if (error || data.user?.email !== account.email || data.user.app_metadata?.numora_qa !== true)
      throw new Error(`Existing ${name} Auth account changed.`);
    if (rotatePasswords) {
      const { error: updateError } = await admin.auth.admin.updateUserById(account.id, {
        password: account.password,
      });
      if (updateError) throw new Error(`Could not rotate ${name} password: ${updateError.message}`);
    }
    continue;
  }
  const prior = existingUsers.find((user) => user.email === account.email);
  if (prior) {
    if (prior.app_metadata?.numora_qa !== true)
      throw new Error(`${name} email belongs to a non-QA account.`);
    account.id = prior.id;
    await save();
    if (rotatePasswords) {
      const { error: updateError } = await admin.auth.admin.updateUserById(prior.id, {
        password: account.password,
      });
      if (updateError) throw new Error(`Could not rotate ${name} password: ${updateError.message}`);
    }
    continue;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    app_metadata: { numora_qa: true },
  });
  if (error || !data.user) throw new Error(`Could not create ${name}: ${error?.message ?? 'unknown error'}`);
  account.id = data.user.id;
  await save();
}
await writeFile(manifestFile, JSON.stringify({
  projectRef: ref,
  mode: 'EMAIL_QA',
  actors: Object.fromEntries(names.map((name) => [name, accounts[name].id])),
}, null, 2), { mode: 0o600 });
console.log('Six Development QA Auth accounts verified; credentials and manifest are in ignored .qa-seed/.');
