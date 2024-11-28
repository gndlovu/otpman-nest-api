import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import _ from 'underscore';

import { SendMailDto } from '../shared/mailer/mailer.interface';
import { DatabaseService } from '../shared/database/database.service';
import { hashPassword } from '../shared/utils/password-hasher.util';
import { MailerService } from '../shared/mailer/mailer.service';

@Injectable()
export class AccountService {
    constructor(
        private readonly dbService: DatabaseService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async signUp(payload: Prisma.UserCreateInput) {
        const exists = await this.dbService.user.findUnique({
            where: { email: payload.email },
        });

        if (exists) {
            throw new ConflictException('Email address already registered.');
        }

        payload.password = await hashPassword(payload.password);

        const user = await this.dbService.user.create({ data: payload });

        const mailDto: SendMailDto = {
            recipients: [
                {
                    name: `${user.firstName} ${user.lastName}`,
                    address: user.email,
                },
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

        return _.omit(user, 'password');
    }
}
