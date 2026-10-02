import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { CodeAttemptModule } from '../security/code-attempt.module';

@Module({
  imports: [IdentityModule, CodeAttemptModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
