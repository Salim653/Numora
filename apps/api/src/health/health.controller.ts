import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API process health' })
  getHealth() {
    return this.healthService.getApplicationHealth();
  }

  @Get('database')
  @ApiOperation({ summary: 'Check PostgreSQL connectivity' })
  getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}
