import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as mailgun from 'mailgun-js';

@Injectable()
export class MailgunService {
  private mg;

  constructor() {
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const data = {
      from: 'no-reply.yoursandeshgeneral.com', // This coundnt be done beccause sendbox require domain
      to: email,
      subject: 'Please verify your email',
      text: `Please verify your email by clicking the following link: ${process.env.BASE_URL}/user/verify?token=${token}`,
    };

    try {
      await this.mg.messages().send(data);
    } catch (error) {
      console.error('Error sending email:', error); // Log the actual error
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
