import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './mailer.interface';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {
    constructor(private readonly configService: ConfigService) {}

    private getMailTransport(): nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> {
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: this.configService.get<boolean>('MAIL_SSL'),
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });

        return transporter;
    }

    async sendMail(mailDto: SendMailDto) {
        const transport = this.getMailTransport();
        const mailOptions: Mail.Options = {
            from: mailDto.from ?? {
                name: this.configService.get<string>('APP_NAME'),
                address: this.configService.get<string>('DEFAULT_MAIL_FROM'),
            },
            to: mailDto.recipients,
            subject: mailDto.subject,
            html: mailDto.html,
        };

        try {
            const result = await transport.sendMail(mailOptions);

            return result;
        } catch (e) {
            console.log('error: ', e);
        }
    }
}
