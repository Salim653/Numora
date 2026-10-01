import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { AdminGuard } from './admin.guard';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, AdminGuard],
  exports: [IdentityService, AdminGuard],
})
export class IdentityModule {}
