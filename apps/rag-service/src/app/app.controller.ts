import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @EventPattern('resume.uploaded')
  async handleResumeUploaded(@Payload() message: any) {
    await this.appService.processResume(message);
  }

  @EventPattern('job.created')
  async handleJobCreated(@Payload() message: any) {
    await this.appService.ingestJob(message.jobId, message.description, message.title);
  }

  // Recruiter: find best candidates for a job
  @Post('search')
  async searchCandidates(@Body() body: { jobDescription: string }) {
    return this.appService.searchCandidates(body.jobDescription);
  }

  // Candidate: ask a question about job fit
  @Post('ask')
  async askQuestion(
    @Body() body: { question: string; jobId: string; resume: string },
  ) {
    return this.appService.askJobQuestion(
      body.question,
      body.jobId,
      body.resume,
    );
  }

  @Post('ingest-job')
  async ingestJob(@Body() body: { jobId: string; description: string }) {
    await this.appService.ingestJob(body.jobId, body.description);
    return { success: true };
  }

  // Analytics
  @Get('analytics')
  async getAnalytics() {
    return this.appService.getAnalytics();
  }
}