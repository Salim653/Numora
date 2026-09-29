import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEMO_ADMIN_AUTH_ID } from '../../config/demo-actor';
import {  CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { ReportsService } from './reports.service';

/**
 * Admin report workflow endpoints. Reports are owned by the `reports` module;
 * the admin UI consumes this surface.
 */
@ApiTags('admin')
@Controller('admin')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('reports')
  listReports(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reports.listReports({
      status: status as UpdateReportDto['status'] | undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Post('reports')
  createReport(@Body() dto: CreateReportDto) {
    return this.reports.createReport(dto);
  }

  @Patch('reports/:id')
  updateReport(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.reports.updateReport(id, dto);
  }
}
