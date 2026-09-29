import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ClassesModule } from './modules/classes/classes.module';
import { LearningModule } from './modules/learning/learning.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),
    HealthModule,
    IdentityModule,
    ClassesModule,
    LearningModule,
    MonitoringModule,
  ],
})
export class AppModule {}
