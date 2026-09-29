import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {  CreateSchoolDto, ListSchoolsDto, UpdateSchoolDto, UpdateSchoolStatusDto } from './dto/schools.dto';
import type { TokenStatus } from './schools.service';
import { SchoolsService } from './schools.service';

/**
 * Admin school and teacher-token endpoints. Token issuance rules live here
 * (MODULE_BOUNDARIES: `schools` owns verification tokens), not in `admin`.
 *
 * The admin actor is not authenticated yet: auth is intentionally out of scope
 * and these endpoints are localhost-only. The audit actor is the seeded DEMO
 * admin user until authorization lands.
 */
@ApiTags('admin')
@Controller('admin')
export class SchoolsController {
  constructor(private readonly schools: SchoolsService) {}

  @Get('schools')
  listSchools(@Query() query: ListSchoolsDto) {
    return this.schools.listSchools(query);
  }

  @Post('schools')
  createSchool(@Body() dto: CreateSchoolDto) {
    return this.schools.createSchool(dto);
  }

  @Get('schools/:id')
  getSchool(@Param('id') id: string) {
    return this.schools.getSchool(id);
  }

  @Patch('schools/:id')
  updateSchool(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schools.updateSchool(id, dto);
  }

  @Patch('schools/:id/status')
  updateSchoolStatus(@Param('id') id: string, @Body() dto: UpdateSchoolStatusDto) {
    return this.schools.updateSchoolStatus(id, dto.status);
  }

  @Delete('schools/:id')
  removeSchool(@Param('id') id: string) {
    return this.schools.removeSchool(id);
  }

  @Get('schools/:schoolId/teacher-tokens')
  listTokens(@Param('schoolId') schoolId: string, @Query('status') status?: TokenStatus) {
    return this.schools.listTokens(schoolId, status);
  }

  @Post('schools/:schoolId/teacher-tokens')
  issueToken(@Param('schoolId') schoolId: string) {
    return this.schools.issueToken(schoolId);
  }

  @Post('schools/:schoolId/teacher-tokens/reissue')
  reissueToken(@Param('schoolId') schoolId: string) {
    return this.schools.issueToken(schoolId, undefined, true);
  }

  @Post('teacher-tokens/:id/revoke')
  revokeToken(@Param('id') id: string) {
    return this.schools.revokeToken(id);
  }

  @Get('dashboard')
  dashboard() {
    return this.schools.dashboardAggregates();
  }
}
