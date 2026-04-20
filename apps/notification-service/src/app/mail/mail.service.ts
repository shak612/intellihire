import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMatchResult(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    score: number;
    reasoning: string;
  }) {
    const { candidateEmail, candidateName, jobTitle, score, reasoning } = data;

    const scoreColor =
      score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
            
            <div style="display: flex; align-items: center; margin-bottom: 24px;">
              <div style="width: 36px; height: 36px; background: #4f46e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                <span style="color: white; font-weight: bold; font-size: 14px;">IH</span>
              </div>
              <span style="font-size: 18px; font-weight: 600; color: #111827;">IntelliHire</span>
            </div>

            <h2 style="color: #111827; margin: 0 0 8px;">Your application has been reviewed!</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Hi ${candidateName}, here's your AI match result for <strong>${jobTitle}</strong>.</p>

            <div style="background: #f3f4f6; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Match score</p>
              <p style="font-size: 48px; font-weight: 700; color: ${scoreColor}; margin: 0;">${score}</p>
              <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">out of 100</p>
            </div>

            <div style="background: #eff6ff; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #1e40af; font-size: 13px; font-weight: 600; margin: 0 0 6px;">AI reasoning</p>
              <p style="color: #1e3a8a; font-size: 14px; margin: 0; line-height: 1.6;">${reasoning}</p>
            </div>

            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              Log in to <a href="http://localhost:5173" style="color: #4f46e5;">IntelliHire</a> to chat with AI about improving your application.
            </p>

          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 16px;">
            Sent by IntelliHire AI Recruitment Platform
          </p>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'IntelliHire <noreply@intellihire.com>',
        to: candidateEmail,
        subject: `Your match score for ${jobTitle}: ${score}/100`,
        html,
      });
      this.logger.log(`Email sent to ${candidateEmail} — score: ${score}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${candidateEmail}: ${err}`);
    }
  }
}