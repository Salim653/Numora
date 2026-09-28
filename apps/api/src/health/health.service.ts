import { Injectable } from '@nestjs/common';
import { checkDatabaseConnection } from '@tka/database';

@Injectable()
export class HealthService {
  getApplicationHealth() {
    return {
      status: 'ok' as const,
      service: 'tka-api',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
    };
  }

  async getDatabaseHealth() {
    const startedAt = performance.now();
    await checkDatabaseConnection();

    return {
      status: 'ok' as const,
      dependency: 'postgresql',
      latencyMs: Math.round(performance.now() - startedAt),
      timestamp: new Date().toISOString(),
    };
  }
}
