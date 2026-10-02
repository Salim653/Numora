import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SchoolsController } from './schools.controller';
import { AdminSchoolsController } from './admin-schools.controller';
import { SchoolsService } from './schools.service';
import { CodeAttemptModule } from '../security/code-attempt.module';

@Module({
  imports: [IdentityModule, CodeAttemptModule],
  controllers: [SchoolsController, AdminSchoolsController],
  providers: [SchoolsService],
})
export class SchoolsModule {}
