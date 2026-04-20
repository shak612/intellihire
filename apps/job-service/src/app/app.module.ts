import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Job } from './entities/job.entity';
import { JobController } from './job/job.controller';
import { JobService } from './job/job.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: config.get<number>('JOB_DB_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('JOB_DB_NAME'),
        entities: [Job],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Job]),
  ],
  controllers: [AppController, JobController],
  providers: [AppService, JobService],
})
export class AppModule {}