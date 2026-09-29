import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { IrtController } from './irt.controller';
import { IrtService } from './irt.service';

@Module({
  imports: [AuditModule],
  controllers: [IrtController],
  providers: [IrtService],
  exports: [IrtService],
})
export class IrtModule {}
