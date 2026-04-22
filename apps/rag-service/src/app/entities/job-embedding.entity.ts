import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_embeddings')
export class JobEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobId: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column('text')
  chunkText: string;

  @Column('int')
  chunkIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}