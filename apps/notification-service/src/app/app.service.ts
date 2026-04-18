import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getData(): { message: string } {
    return { message: 'Notification Service is running!' };
  }

  async sendNotification(data: { candidateId: string; score: number }) {
    // Phase 4 will wire real email sending (nodemailer/sendgrid)
    this.logger.log(
      `Sending notification to candidate ${data.candidateId} — Match score: ${data.score}`,
    );
  }
}