import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OtpService {
  constructor(private readonly dbService: DatabaseService, private readonly configService: ConfigService) {}

  async generateOtp(userId: number): Promise<string> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 60 * 60 * 24 * 1000);
     // const expireSec = 120;
    // const expiresAt = new Date(now.getTime() + (1000 * expireSec));

    // 3. A user cannot request more than X OTPs per hour. X is a config/environment variable set to 3 for now,
    if (await this.hasReachedHourlyLimit(userId)) {
      // throw new UnprocessableEntityException(
      //   `Maximum of ${this.configService.get<number>('MAX_OTP_REQ_PER_HR')} OTP requests per hour has been reached.`
      // );
    }

    // 
    // let otp = await this.dbService.otp.findFirst({
    //   where: {
    //     AND: [
    //       { userId },
    //       { createdAt: { gt: twentyFourHoursAgo } }, // 2. A user cannot receive the same OTP number if it's within a 24 hour period.
    //       { isExpired: false },
    //       { isUsed: false } // 8. An OTP cannot be used more than once.
    //     ]
    //   },
    //   orderBy: { createdAt: 'desc' } // 4. Only the latest OTP can be valid at any given time.
    // });

    // 4. Only the latest OTP can be valid at any given time.
    let otp = await this.dbService.otp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('latestOtp: ', otp);

    if (!otp || otp.expiresAt < now) {
      // First time generation / token expired
      otp = await this.generateNewOtp(userId);
      console.log('newOtp no checks: ', otp);
    } else {
      // Do some checks before generating

    /*-1. The OTP should be 6 digits long and it should be possible for it to start with 0.
      - 2. A user cannot receive the same OTP number if it's within a 24 hour period. If that happens, a new one
      should be generated and the user should not be made aware that the same one was randomly
      generated.
      - 3. A user cannot request more than X OTPs per hour. X is a config/environment variable set to 3 for now,
      we should be able to change this easily.
      - 4. Only the latest OTP can be valid at any given time.
      - 5. An OTP expires after X seconds. X is a config/environment variable set to 30 seconds for now.
      - 6. If a user requests the OTP to be resent within X minutes, it will resend the original OTP (and update the
      expiry) instead of generating a new one. X is a config variable set to 5 for now.
      - 7. An OTP cannot be resent more than X times. X is a config variable set to 3 for now.
      - 8. An OTP cannot be used more than once.*/

      if (twentyFourHoursAgo > otp.createdAt) {
        otp = await this.generateNewOtp(userId);
      } else {
        // 6. If a user requests the OTP to be resent within X minutes, it will resend the original OTP (and update the expiry) instead of generating a new one. X is a config variable set to 5 for now.
        const resendMinInterval = new Date();
        resendMinInterval.setMinutes(resendMinInterval.getMinutes() + this.configService.get<number>('OTP_RESEND_MIN_INTERVAL'));
        if (resendMinInterval > otp.createdAt) {
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + this.configService.get<number>('OTP_EXPIRE_SEC'));
          otp.expiresAt = expiresAt;

          await this.dbService.otp.update({
            where: {
              id: otp.id,
            },
            data: otp,
          });
        }

        // 7. An OTP cannot be resent more than X times. X is a config variable set to 3 for now.
        if (otp.resentCount >= this.configService.get<number>('OTP_MAX_RESEND')) {
          otp = await this.generateNewOtp(userId);
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

    return otp.pin;
  }

  private async generateNewOtp(userId: number) {
    let pin;
    let isUsed = true;
    const max = Math.pow(10, 6);

    do {
      pin = crypto.randomInt(0, max).toString().padStart(6, '0'); // 1. The OTP should be 6 digits long and it should be possible for it to start with 0.
      isUsed = await this.dbService.otp.count({
        where: {
          AND: [
            { pin },
            { userId },
            { isUsed: true }, // 8. An OTP cannot be used more than once.
          ]
        },
      }) > 0; 
    } while (isUsed);
    
    // 5. An OTP expires after X seconds. X is a config/environment variable set to 30 seconds for now.
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.configService.get<number>('OTP_EXPIRE_SEC'));

    const payload: Prisma.OtpUncheckedCreateInput = { pin, userId, expiresAt };

    const otp = await this.dbService.otp.create({
      data: payload
    });

    return otp;
  }

  private async hasReachedHourlyLimit(userId: number) {
    const date = new Date();
    date.setHours(date.getHours() - 1);

    return await this.dbService.otp.count({
      where: {
        AND: [
          { userId },
          { createdAt: { gt: date } }
        ]
      },
    }) > this.configService.get<number>('MAX_OTP_REQ_PER_HR');
  }
}
