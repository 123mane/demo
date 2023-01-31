import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import config from 'src/config/config';
// const { websiteUrl } = config.app;

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async resetPassword(to: string, token: string) {
    // let frontendUrl = websiteUrl;
    // let link = `${frontendUrl}reset?token=${token}`;
    let link = `reset/reset?token=${token}`;
    return await this.mailerService.sendMail({
      to: to,
      subject: 'Astroon Reset Password Link',
      template: './resetPassword', // `.hbs` extension is appended automatically
      context: {
        link,
      },
    });
  }

  async replyingContactUsMail(to: string, description: string) {
    return await this.mailerService.sendMail({
      to: to,
      subject: 'Contact-Us reply',
      template: './contactUsReply', // `.hbs` extension is appended automatically
      context: {
        description,
      },
    });
  }
}
