import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { ContentModule } from './modules/content/content.module';
import { IrtModule } from './modules/irt/irt.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),
    DatabaseModule,
    HealthModule,
    AdminModule,
    ContentModule,
    IrtModule,
    ReportsModule,
    SchoolsModule,
  ],
})
export class AppModule {}
