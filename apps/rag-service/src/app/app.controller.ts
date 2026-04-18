import { Controller, Get } from '@nestjs/common';
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
    // const data = JSON.parse(message.value);
    const data = message;
    await this.appService.processResume(data);
  }
}