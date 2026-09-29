import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

type Db = PostgresJsDatabase<typeof schema>;

type DatabaseConnection = {
  client: ReturnType<typeof postgres>;
  db: Db;
};

let connection: DatabaseConnection | undefined;

export function getDatabase(): DatabaseConnection {
  if (connection) return connection;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !/^[a-z][a-z0-9+.-]*:\/\//i.test(databaseUrl)) {
    throw new Error('DATABASE_URL is not configured.');
  }

  // Parse URL here instead of passing the string straight to postgres(): some
  // driver versions mishandle credentials from a connection string, while the
  // option-object form always authenticates.
  const { hostname, port, username, password, pathname } = new URL(databaseUrl);

  const client = postgres({
    host: hostname || '127.0.0.1',
    port: Number(port || '5432'),
    username: username || 'postgres',
    password: password || '',
    database: pathname.replace(/^\//, '') || 'postgres',
    max: Number(process.env.DB_POOL_MAX ?? 10),
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
