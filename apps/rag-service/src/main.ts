import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'rag-service',
        brokers: ['localhost:9092'],
      },
      consumer: { groupId: 'rag-consumer' },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);
  Logger.log('RAG Service running on http://localhost:3003');
}
bootstrap();