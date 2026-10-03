import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminOperationsController } from './operations.controller';
import { AdminOperationsService } from './operations.service';
@Module({
  imports: [IdentityModule],
  controllers: [AdminController, AdminOperationsController],
  providers: [AdminService, AdminOperationsService],
})
export class AdminModule {}
