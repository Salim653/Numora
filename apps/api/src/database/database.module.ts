import { Global, Module } from '@nestjs/common';
import { closeDatabaseConnection, getDatabase } from '@tka/database';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@tka/database';

export const DATABASE = Symbol('DATABASE');

export type Db = ReturnType<typeof getDatabase>['db'];

const databaseProvider = {
  provide: DATABASE,
  useFactory: () => getDatabase().db as Db,
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule {}

export { closeDatabaseConnection };
