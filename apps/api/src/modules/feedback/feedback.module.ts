import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { LearningModule } from '../learning/learning.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
@Module({
  imports: [IdentityModule, LearningModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
