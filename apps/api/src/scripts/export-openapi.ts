import 'reflect-metadata';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { configureApplication } from '../bootstrap';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = configureApplication(app);

  const outputDir = resolve(__dirname, '../../../../packages/contracts/openapi');
  const outputFile = resolve(outputDir, 'openapi.json');
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();

  console.log(`OpenAPI written to ${outputFile}`);
}

void exportOpenApi();
