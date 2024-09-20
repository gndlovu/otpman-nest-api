import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { DatabaseService } from '../../database/database.service';
import { MailerService } from '../../mailer/mailer.service';
import { SendMailDto } from '../../mailer/mailer.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly dbService: DatabaseService, 
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
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

    async login(payload: LoginDto): Promise<{accessToken: string}> {
        const user = await this.dbService.user.findFirst({
            where: {
                email: payload.email
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email / password.');
        }

        const isValid = await this.decryptPassword(payload.password, user.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid email / password.');
        }

        // TODO - Only generate accessToken after successful OTP validation
        const accessToken = await this.jwtService.signAsync({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
        });

        return { accessToken };
    }
    
    private async encryptPassword(password, salt) {
        return await bcrypt.hash(password, salt);
    }

    private async decryptPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}
