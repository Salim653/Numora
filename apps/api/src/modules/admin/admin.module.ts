import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ContentModule } from '../content/content.module';
import { IrtModule } from '../irt/irt.module';
import { ReportsModule } from '../reports/reports.module';
import { SchoolsModule } from '../schools/schools.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * Admin application services. This module orchestrates the domain modules; it
 * does not duplicate their business rules (MODULE_BOUNDARIES).
 */
@Module({
  imports: [AuditModule, ContentModule, IrtModule, ReportsModule, SchoolsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
