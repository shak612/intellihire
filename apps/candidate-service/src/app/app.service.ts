import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  getData(): { message: string } {
    return { message: 'Candidate Service is running!' };
  }

  async uploadResume(candidateId: string, resumeText: string) {
    const payload = {
      candidateId,
      resumeText,
      uploadedAt: new Date().toISOString(),
    };

    this.kafkaClient.emit('resume.uploaded', {
      key: candidateId,
      value: JSON.stringify(payload),
    });

    return { success: true, message: 'Resume uploaded and event published' };
  }
}