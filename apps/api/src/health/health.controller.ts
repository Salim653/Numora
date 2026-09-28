import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API process health' })
  @ApiOkResponse({ description: 'API is healthy' })
  getHealth() {
    return this.healthService.getApplicationHealth();
  }

  @Get('database')
  @ApiOperation({ summary: 'Check PostgreSQL connectivity' })
  @ApiOkResponse({ description: 'Database is reachable' })
  getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}
