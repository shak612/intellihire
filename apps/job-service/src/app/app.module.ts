import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Job } from './entities/job.entity';
import { JobController } from './job/job.controller';
import { JobService } from './job/job.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.JOB_DB_HOST || 'localhost',
      port: parseInt(process.env.JOB_DB_PORT || '5433'),
      username: process.env.POSTGRES_USER || 'intellihire',
      password: process.env.POSTGRES_PASSWORD || 'intellihire123',
      database: process.env.JOB_DB_NAME || 'job_db',
      entities: [Job],
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'job-service',
            brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')],
          },
          consumer: { groupId: 'job-service-consumer' },
        },
      },
    ]),
    TypeOrmModule.forFeature([Job]),
  ],
  controllers: [AppController, JobController],
  providers: [AppService, JobService],
})
export class AppModule {}