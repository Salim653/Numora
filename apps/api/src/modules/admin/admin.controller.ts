import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from '../audit/audit.service';
import { ContentService } from '../content/content.service';
import { ReportsService } from '../reports/reports.service';
import { SchoolsService } from '../schools/schools.service';

/**
 * Admin orchestration surface: aggregates the domain modules into the admin
 * dashboard and exposes audit logs. Per MODULE_BOUNDARIES this module holds no
 * duplicated content/school business rules.
 */
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly schools: SchoolsService,
    private readonly content: ContentService,
    private readonly reports: ReportsService,
    private readonly audit: AuditService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const [schoolAggregates, contentAggregates, openReports, publishedPackages] = await Promise.all([
      this.schools.dashboardAggregates(),
      this.content.dashboardAggregates(),
      this.reports.openReportCount(),
      this.content.publishedPackageCount(),
    ]);

    return {
      schools: schoolAggregates.schools,
      content: contentAggregates,
      teacherTokens: schoolAggregates.teacherTokens,
      openReports,
      publishedTryoutPackages: publishedPackages,
    };
  }

  @Get('audit-logs')
  auditLogs(@Query('limit') limit?: number, @Query('offset') offset?: number, @Query('entityType') entityType?: string) {
    return this.audit.list({ limit, offset, entityType });
  }
}
