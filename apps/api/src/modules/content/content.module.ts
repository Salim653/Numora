import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [IdentityModule],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
