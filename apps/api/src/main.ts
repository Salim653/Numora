import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './bootstrap';
import { requireTeacherTokenPepper } from './modules/schools/teacher-token';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  requireTeacherTokenPepper();
  configureApplication(app);

  const port = Number(process.env.API_PORT ?? 3001);
  // Let Node bind both IPv4 and IPv6 so either localhost address can reach the API.
  await app.listen(port);
}

void bootstrap();
