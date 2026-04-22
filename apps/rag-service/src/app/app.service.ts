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

    let score = 0;
    let reasoning = 'Resume ingested successfully.';
    let jobId = '';
    let jobTitle = 'Unknown Position';

    try {
      // Get the most recently posted job
      const jobMatches = await this.dataSource.query(`
        SELECT DISTINCT "jobId"
        FROM job_embeddings
        LIMIT 1
      `);

      if (jobMatches.length > 0) {
        jobId = jobMatches[0].jobId;

        const results = await this.agentService.findBestCandidates(
          data.resumeText,
        );
        const match = results.find((r) => r.candidateId === data.candidateId);
        if (match) {
          score = match.score;
          reasoning = match.reasoning;
        }

        // Fetch job title from job_embeddings context
        const jobContext = await this.dataSource.query(
          `SELECT "jobTitle" FROM job_embeddings WHERE "jobId" = $1 LIMIT 1`,
          [jobId],
        );
        
        jobTitle = jobContext[0]?.jobTitle || 'Open Position';
      }
    } catch (err) {
      this.logger.error(`Scoring failed: ${err}`);
    }

    this.kafkaClient.emit('match.result', {
      key: data.candidateId,
      value: JSON.stringify({
        candidateId: data.candidateId,
        score,
        reasoning,
        jobId,
        jobTitle,
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

  async ingestJob(jobId: string, description: string, title?: string) {
    await this.ingestionService.ingestJob(jobId, description, title);
  }

  async getAnalytics() {
    const results = await this.dataSource.query(`
      SELECT
        COUNT(DISTINCT "candidateId") as total_candidates,
        COUNT(*) as total_chunks,
        AVG(CHAR_LENGTH("chunkText")) as avg_chunk_length
      FROM resume_embeddings
    `);

    return {
      totalCandidates: parseInt(results[0]?.total_candidates || '0'),
      totalChunks: parseInt(results[0]?.total_chunks || '0'),
    };
  }
}