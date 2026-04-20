import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreateJobDto, UpdateJobDto } from '../dto/job.dto';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  create(@Body(ValidationPipe) dto: CreateJobDto) {
    return this.jobService.create(dto);
  }

  @Get()
  findAll() {
    return this.jobService.findAll();
  }

  @Get('recruiter/:recruiterId')
  findByRecruiter(@Param('recruiterId') recruiterId: string) {
    return this.jobService.findByRecruiter(recruiterId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Query('recruiterId') recruiterId: string,
    @Body(ValidationPipe) dto: UpdateJobDto,
  ) {
    return this.jobService.update(id, recruiterId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('recruiterId') recruiterId: string,
  ) {
    return this.jobService.remove(id, recruiterId);
  }
}