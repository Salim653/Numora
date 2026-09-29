import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SchoolsController } from './schools.controller';
import { AdminSchoolsController } from './admin-schools.controller';
import { SchoolsService } from './schools.service';

@Module({
  imports: [IdentityModule],
  controllers: [SchoolsController, AdminSchoolsController],
  providers: [SchoolsService],
})
export class SchoolsModule {}
