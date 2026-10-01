import { closeDatabaseConnection, getDatabase } from './client.js';
import { inspectSchema } from './schema-compatibility.js';

async function run() {
  try {
    const state = await inspectSchema(getDatabase().client);
    for (const problem of state.problems) console.error(problem);
    if (state.problems.length) process.exitCode = 1;
    else console.log(`Database schema check passed: ${state.expectedTables} expected tables and columns present; RLS enabled.`);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : 'configuration_or_connection';
    console.error(`Database schema check failed (${code}). No credentials are printed.`);
    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
}
void run();
