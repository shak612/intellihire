import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { JobStatus } from '../entities/job.entity';

export class CreateJobDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  location: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsString()
  recruiterId: string;
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  skills?: string[];

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}