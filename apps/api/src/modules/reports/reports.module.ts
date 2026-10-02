import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { StudentSupportController } from './student-support.controller';
import { StudentSupportService } from './student-support.service';
@Module({
  imports: [IdentityModule],
  controllers: [ReportsController, StudentSupportController],
  providers: [ReportsService, StudentSupportService],
})
export class ReportsModule {}
