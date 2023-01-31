import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import configuration from 'src/config/config';
const { host, user, password, senderMail } =
  configuration.smtpMailConfiguration;

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host,
        secure: false,
        auth: {
          user,
          pass: password,
        },
      },
      defaults: {
        from: senderMail,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
