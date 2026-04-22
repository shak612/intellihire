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
import { JobEmbedding } from './entities/job-embedding.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.RAG_DB_HOST || 'localhost',
      port: parseInt(process.env.RAG_DB_PORT || '5435'),
      username: process.env.POSTGRES_USER || 'intellihire',
      password: process.env.POSTGRES_PASSWORD || 'intellihire123',
      database: process.env.RAG_DB_NAME || 'rag_db',
      entities: [ResumeEmbedding, JobEmbedding],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ResumeEmbedding, JobEmbedding]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'rag-service-producer',
            brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')],
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