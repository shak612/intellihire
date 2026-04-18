import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumeEmbedding } from './entities/resume-embedding.entity';
import { EmbeddingService } from './services/embedding.service';
import { IngestionService } from './services/ingestion.service';
import { AgentService } from './services/agent.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: config.get<number>('RAG_DB_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('RAG_DB_NAME'),
        entities: [ResumeEmbedding],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ResumeEmbedding]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'rag-service-producer',
            brokers: ['localhost:9092'],
          },
          consumer: { groupId: 'rag-producer-group' },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, EmbeddingService, IngestionService, AgentService],
})
export class AppModule {}