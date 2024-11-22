import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import _ from 'underscore';

import { MailerService } from '../shared/mailer/mailer.service';
import { DatabaseService } from '../shared/database/database.service';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from '../shared/utils/password-hasher.util';
import { generateOTP } from '../shared/utils/code-generator.utl';
import { SendMailDto } from '../shared/mailer/mailer.interface';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly dbService: DatabaseService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async login(payload: LoginDto) {
        const user = await this.dbService.user.findFirst({
            where: { email: payload.email },
        });

        if (!user) {
            throw new BadRequestException('Invalid email or password.');
        }

        const isValid = await verifyPassword(payload.password, user.password);
        if (!isValid) {
            throw new BadRequestException('Invalid email or password.');
        }

        await this.requestOtp(user.id);

        return _.omit(user, 'password');
    }

    async requestOtp(userId: number) {
        const user = await this.dbService.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found.');
        }

        // 3. A user cannot request more than X OTPs per hour. X is a config/environment variable set to 3 for now,
        //   we should be able to change this easily.
        if (await this.hasReachedHourlyLimit(userId)) {
            throw new BadRequestException(
                `Maximum of ${this.configService.get<number>('MAX_OTP_REQ_PER_HR')} OTP requests per hour has been reached.`,
            );
        }

        // 4. Only the latest OTP can be valid at any given time.
        let otp = await this.dbService.otp.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const now = new Date();

        if (!otp || otp.expiresAt.getTime() < now.getTime() || otp.isUsed) {
            // First time generation / token expired / isUsed
            otp = await this.createOtp(userId);
        } else {
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            if (twentyFourHoursAgo.getTime() > otp.createdAt.getTime()) {
                otp = await this.createOtp(userId);
            } else {
                // 6. If a user requests the OTP to be resent within X minutes, it will resend the original OTP (and update the expiry) instead of generating a new one. X is a config variable set to 5 for now.
                const resendMinInterval = new Date();
                resendMinInterval.setMinutes(
                    resendMinInterval.getMinutes() +
                        +this.configService.get<number>(
                            'OTP_RESEND_MIN_INTERVAL',
                        ),
                );

                if (resendMinInterval.getTime() > otp.createdAt.getTime()) {
                    const expiresAt = new Date();
                    expiresAt.setSeconds(
                        expiresAt.getSeconds() +
                            +this.configService.get<number>('OTP_EXPIRE_SEC'),
                    );
                    otp.expiresAt = expiresAt;

                    await this.dbService.otp.update({
                        where: {
                            id: otp.id,
                        },
                        data: otp,
                    });

                    console.log(
                        'If a user requests the OTP to be resent within X minutes, it will resend the original OTP',
                        otp,
                    );
                }

                // 7. An OTP cannot be resent more than X times. X is a config variable set to 3 for now.
                if (
                    otp.resentCount >=
                    +this.configService.get<number>('OTP_MAX_RESEND')
                ) {
                    otp = await this.createOtp(userId);
                } else {
                    otp.resentCount++;
                    await this.dbService.otp.update({
                        where: {
                            id: otp.id,
                        },
                        data: otp,
                    });
                }
            }
        }

        await this.sendOtpMail(user, otp.pin);
    }

    async verifyOtp(payload: OtpVerifyDto) {
        const otp = await this.dbService.otp.findFirst({
            where: { userId: payload.userId },
            orderBy: { createdAt: 'desc' },
        });

        const now = new Date();

        // 4. Only the latest OTP can be valid at any given time.
        if (
            !otp ||
            otp.pin !== payload.pin ||
            otp.expiresAt.getTime() < now.getTime() ||
            otp.isUsed
        ) {
            throw new UnauthorizedException(
                'Invalid pin, please try again or request a new one.',
            );
        }

        otp.isUsed = true;
        await this.dbService.otp.update({
            where: {
                id: otp.id,
            },
            data: otp,
        });

        const accessToken = await this.getAccessToken(otp.userId);

        return { accessToken };
    }

    private async getAccessToken(userId: number) {
        const user = await this.dbService.user.findFirst({
            where: { id: userId },
        });

        const accessToken = await this.jwtService.signAsync({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
        });

        return accessToken;
    }

    private async createOtp(userId: number) {
        let pin;
        let isUsed = true;

        do {
            pin = generateOTP(); // 1. The OTP should be 6 digits long and it should be possible for it to start with 0.
            isUsed =
                (await this.dbService.otp.count({
                    where: {
                        AND: [
                            { pin },
                            { userId },
                            { isUsed: true }, // 8. An OTP cannot be used more than once.
                        ],
                    },
                })) > 0;
        } while (isUsed);

        // 5. An OTP expires after X seconds. X is a config/environment variable set to 30 seconds for now.
        const expiresAt = new Date();
        expiresAt.setSeconds(
            expiresAt.getSeconds() +
                +this.configService.get<number>('OTP_EXPIRE_SEC'),
        );

        const payload: Prisma.OtpUncheckedCreateInput = {
            pin,
            userId,
            expiresAt,
        };

        const otp = await this.dbService.otp.create({
            data: payload,
        });

        return otp;
    }

    private async hasReachedHourlyLimit(userId: number) {
        const date = new Date();
        date.setHours(date.getHours() - 1);

        return (
            (await this.dbService.otp.count({
                where: {
                    AND: [{ userId }, { createdAt: { gt: date } }],
                },
            })) > this.configService.get<number>('MAX_OTP_REQ_PER_HR')
        );
    }

    private async sendOtpMail(user: User, pin: string) {
        const mailDto: SendMailDto = {
            recipients: [
                {
                    name: `${user.firstName} ${user.lastName}`,
                    address: user.email,
                },
            ],
            subject: `Your ${this.configService.get<string>('APP_NAME')} OTP.`,
            html: `
              <p>
                  <strong>Hello ${user.firstName}</strong>, 
                  Your One-Time PIN to log in to ${this.configService.get<string>('APP_NAME')} is: ${pin}.
              </p>
              <p>Cheers!</p>
          `,
        };

        await this.mailerService.sendMail(mailDto);
    }
}
