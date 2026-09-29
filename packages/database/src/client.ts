import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

type DatabaseConnection = {
  client: ReturnType<typeof postgres>;
  db: ReturnType<typeof drizzle>;
};

let connection: DatabaseConnection | undefined;

export function getDatabase(): DatabaseConnection {
  if (connection) return connection;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const client = postgres(databaseUrl, {
    max: Number(process.env.DB_POOL_MAX ?? 3),
    idle_timeout: 20,
  });

  connection = {
    client,
    db: drizzle(client, { schema }),
  };

  return connection;
}

export async function checkDatabaseConnection() {
  const { client } = getDatabase();
  const result = await client<{ ok: number }[]>`select 1 as ok`;
  if (result[0]?.ok !== 1) throw new Error('Database health check failed.');
}

export async function closeDatabaseConnection() {
  if (!connection) return;
  await connection.client.end();
  connection = undefined;
}
