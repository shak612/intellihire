import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
  Logger.log(`🚀 API Gateway running on http://localhost:3000`);
}
bootstrap();