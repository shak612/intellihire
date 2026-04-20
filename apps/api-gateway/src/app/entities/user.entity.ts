import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  RECRUITER = 'recruiter',
  CANDIDATE = 'candidate',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CANDIDATE })
  role: UserRole;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}