import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ResumeEmbedding } from '../entities/resume-embedding.entity';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(ResumeEmbedding)
    private readonly resumeRepo: Repository<ResumeEmbedding>,
    private readonly embeddingService: EmbeddingService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Ensure pgvector extension and correct column type on boot
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
    await this.dataSource.query(`
      ALTER TABLE resume_embeddings
      ADD COLUMN IF NOT EXISTS embedding vector(768)
    `);
    this.logger.log('resume_embeddings table ready with vector column');
  }

  async ingestResume(candidateId: string, resumeText: string): Promise<void> {
    this.logger.log(`Ingesting resume for candidate: ${candidateId}`);

    // Delete old embeddings for this candidate
    await this.resumeRepo.delete({ candidateId });

    const chunks = this.embeddingService.chunkText(resumeText);
    this.logger.log(`Split into ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = await this.embeddingService.generateEmbedding(chunk);

      await this.dataSource.query(
        `INSERT INTO resume_embeddings
         ("candidateId", "chunkText", "chunkIndex", embedding, "createdAt")
         VALUES ($1, $2, $3, $4::vector, NOW())`,
        [candidateId, chunk, i, JSON.stringify(vector)],
      );

      this.logger.log(`Stored chunk ${i + 1}/${chunks.length}`);
    }

    this.logger.log(`Resume ingestion complete for: ${candidateId}`);
  }

  async searchSimilarResumes(
    queryText: string,
    topK = 5,
  ): Promise<Array<{ candidateId: string; chunkText: string; similarity: number }>> {
    const queryVector = await this.embeddingService.generateEmbedding(queryText);

    const results = await this.dataSource.query(
      `SELECT "candidateId", "chunkText",
              1 - (embedding <=> $1::vector) as similarity
       FROM resume_embeddings
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(queryVector), topK],
    );

    return results;
  }
}