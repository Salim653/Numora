import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { closeDatabaseConnection, getDatabase } from './client.js';

async function run() {
  const { db } = getDatabase();
  const migrationsFolder = resolve(process.cwd(), 'drizzle');

  await migrate(db, { migrationsFolder });
  console.log(`Applied migrations from ${migrationsFolder}`);
  await closeDatabaseConnection();
}

run().catch(async (error) => {
  console.error(error);
  await closeDatabaseConnection();
  process.exit(1);
});
