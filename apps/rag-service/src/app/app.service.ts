import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { IngestionService } from './services/ingestion.service';
import { AgentService } from './services/agent.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly ingestionService: IngestionService,
    private readonly agentService: AgentService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
    this.logger.log('pgvector extension enabled');
  }

  getData() {
    return { message: 'RAG Service is running!' };
  }

  async processResume(data: { candidateId: string; resumeText: string }) {
    this.logger.log(`Processing resume for: ${data.candidateId}`);
    await this.ingestionService.ingestResume(data.candidateId, data.resumeText);

    this.kafkaClient.emit('match.result', {
      key: data.candidateId,
      value: JSON.stringify({
        candidateId: data.candidateId,
        score: 0,
        processedAt: new Date().toISOString(),
      }),
    });
  }

  async searchCandidates(jobDescription: string) {
    return this.agentService.findBestCandidates(jobDescription);
  }

  async askJobQuestion(question: string, jobId: string, resume: string) {
    return this.agentService.answerCandidateQuestion(question, jobId, resume);
  }
}