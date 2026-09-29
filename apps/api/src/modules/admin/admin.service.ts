import { Injectable } from '@nestjs/common';
import { ContentService } from '../content/content.service';
import { IrtService } from '../irt/irt.service';
import { ReportsService } from '../reports/reports.service';
import { SchoolsService } from '../schools/schools.service';

/**
 * Admin application service. Thin orchestration over the domain modules so the
 * admin UI can compose views without reaching into domain internals.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly schools: SchoolsService,
    private readonly content: ContentService,
    private readonly reports: ReportsService,
    private readonly irt: IrtService,
  ) {}

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

  irtOverview(questionVersionId: string) {
    return this.irt.getAggregate(questionVersionId);
  }
}
