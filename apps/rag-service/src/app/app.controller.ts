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
}