import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from '../dto/job.dto';
import { UpdateJobDto } from '../dto/job.dto';
import { Job, JobStatus } from '../entities/job.entity';

@Injectable()
export class JobService implements OnModuleInit {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async create(dto: CreateJobDto): Promise<Job> {
    const job = this.jobRepo.create(dto);
    const saved = await this.jobRepo.save(job);

    this.kafkaClient.emit('job.created', {
      key: saved.id,
      value: JSON.stringify({
        jobId: saved.id,
        title: saved.title,
        description: saved.description,
      }),
    });

    return saved;
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