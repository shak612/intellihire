import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  getData(): { message: string } {
    return { message: 'RAG Service is running!' };
  }

  async processResume(data: { candidateId: string; resumeText: string }) {
    this.logger.log(`Processing resume for candidate: ${data.candidateId}`);

    // Phase 3 will add real embeddings here
    const mockScore = Math.floor(Math.random() * 40) + 60;

    this.logger.log(`Match score for ${data.candidateId}: ${mockScore}`);

    // Publish result back to Kafka
    this.kafkaClient.emit('match.result', {
      key: data.candidateId,
      value: JSON.stringify({
        candidateId: data.candidateId,
        score: mockScore,
        processedAt: new Date().toISOString(),
      }),
    });
  }
}