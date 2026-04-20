import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from '../dto/job.dto';
import { UpdateJobDto } from '../dto/job.dto';
import { Job, JobStatus } from '../entities/job.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = this.jobRepo.create(dto);
    return this.jobRepo.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobRepo.find({
      where: { status: JobStatus.OPEN },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  async update(id: string, recruiterId: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);
    if (job.recruiterId !== recruiterId) {
      throw new ForbiddenException('You can only edit your own jobs');
    }
    Object.assign(job, dto);
    return this.jobRepo.save(job);
  }

  async remove(id: string, recruiterId: string): Promise<{ message: string }> {
    const job = await this.findOne(id);
    if (job.recruiterId !== recruiterId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }
    await this.jobRepo.remove(job);
    return { message: 'Job deleted successfully' };
  }

  async findByRecruiter(recruiterId: string): Promise<Job[]> {
    return this.jobRepo.find({
      where: { recruiterId },
      order: { createdAt: 'DESC' },
    });
  }
}