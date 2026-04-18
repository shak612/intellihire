import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('resume_embeddings')
export class ResumeEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  candidateId: string;

  @Column('text')
  chunkText: string;

  @Column('int')
  chunkIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}