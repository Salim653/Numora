import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { CodeAttemptLimiter } from './code-attempt-limiter';
import { CodeAttemptGuard } from './code-attempt.guard';

@Module({
  imports: [IdentityModule],
  providers: [CodeAttemptLimiter, CodeAttemptGuard],
  exports: [CodeAttemptLimiter, CodeAttemptGuard],
})
export class CodeAttemptModule {}
