import { Controller, Post, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('resume/upload')
  uploadResume(@Body() body: { candidateId: string; resumeText: string }) {
    return this.appService.uploadResume(body.candidateId, body.resumeText);
  }
}