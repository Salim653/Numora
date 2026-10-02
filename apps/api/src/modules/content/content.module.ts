import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { DrillPackagesController } from './drill-packages.controller';
import { DrillPackagesService } from './drill-packages.service';

@Module({
  imports: [IdentityModule],
  controllers: [ContentController, DrillPackagesController],
  providers: [ContentService, DrillPackagesService],
  exports: [ContentService, DrillPackagesService],
})
export class ContentModule {}
