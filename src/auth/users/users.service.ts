import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../../database/database.service';
import { MailerService } from '../../mailer/mailer.service';
import { SendMailDto } from '../../mailer/mailer.interface';

@Injectable()
export class UsersService {
    constructor(
        private readonly dbService: DatabaseService, 
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) {}

    async create(payload: Prisma.UserCreateInput) {
        const exists = await this.dbService.user.findFirst({
            where: {
                email: payload.email
            }
        });

        if (exists) {
            throw new BadRequestException('Email address already registered.');
        }

        payload.password = await this.encryptPassword(payload.password, 10);

        const user = await this.dbService.user.create({
          data: payload,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        });

        const mailDto: SendMailDto = {
            recipients: [
                {
                    name: `${user.firstName} ${user.lastName}`,
                    address: user.email,
                }
            ],
            subject: 'Successful Registration',
            html: `
                <p>
                    <strong>Hello ${user.firstName}</strong>, your account has been successfully created.
                    Click <a href="${this.configService.get<string>('FE_BASE_URL')}">here</a> to login.
                </p>
                <p>Cheers!</p>
            `,
        };

        await this.mailerService.sendMail(mailDto);

        return user;
    }

    private async encryptPassword(password, salt) {
        return await bcrypt.hash(password, salt);
    }
}
