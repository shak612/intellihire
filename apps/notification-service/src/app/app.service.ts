import { Injectable, Logger } from '@nestjs/common';
import { MailService } from './mail/mail.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly mailService: MailService) {}

  getData(): { message: string } {
    return { message: 'Notification Service is running!' };
  }

  async sendNotification(data: {
    candidateId: string;
    score: number;
    reasoning?: string;
    jobId?: string;
    jobTitle?: string;
    processedAt: string;
  }) {
    this.logger.log(
      `Sending notification to ${data.candidateId} — score: ${data.score} — job: ${data.jobTitle}`,
    );

    const candidateEmail = data.candidateId.includes('@')
      ? data.candidateId
      : `${data.candidateId}@example.com`;

    const jobTitle = data.jobTitle || 'Open Position';

    const reasoning = data.reasoning ||
      `Based on your resume analysis, you scored ${data.score}/100. ${
        data.score >= 80
          ? 'Excellent match! Your skills align very well with the role.'
          : data.score >= 60
          ? 'Good match! There are a few areas you could strengthen.'
          : 'Keep working on the required skills for this role.'
      }`;

    await this.mailService.sendMatchResult({
      candidateEmail,
      candidateName: data.candidateId,
      jobTitle,
      score: data.score,
      reasoning,
    });
  }
}