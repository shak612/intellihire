import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.CANDIDATE_DB_HOST || 'localhost',
      port: parseInt(process.env.CANDIDATE_DB_PORT || '5434'),
      username: process.env.POSTGRES_USER || 'intellihire',
      password: process.env.POSTGRES_PASSWORD || 'intellihire123',
      database: process.env.CANDIDATE_DB_NAME || 'candidate_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'candidate-service',
            brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')],
          },
          consumer: { groupId: 'candidate-consumer' },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}