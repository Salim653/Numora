import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('returns the application health contract', () => {
    const controller = new HealthController(new HealthService());
    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('tka-api');
    expect(result.timestamp).toBeTruthy();
  });
});
