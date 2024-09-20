import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(private readonly dbService: DatabaseService) {}

  async generateOtp(userId: number): Promise<string> {
  /*1. The OTP should be 6 digits long and it should be possible for it to start with 0. Check
    2. A user cannot receive the same OTP number if it's within a 24 hour period. If that happens, a new one
    should be generated and the user should not be made aware that the same one was randomly
    generated.
    3. A user cannot request more than X OTPs per hour. X is a config/environment variable set to 3 for now,
    we should be able to change this easily.
    4. Only the latest OTP can be valid at any given time.
    5. An OTP expires after X seconds. X is a config/environment variable set to 30 seconds for now.
    6. If a user requests the OTP to be resent within X minutes, it will resend the original OTP (and update the
    expiry) instead of generating a new one. X is a config variable set to 5 for now.
    7. An OTP cannot be resent more than X times. X is a config variable set to 3 for now.
    8. An OTP cannot be used more than once.*/

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 60 * 60 * 24 * 1000);
    
    console.log('now: ', now);
    console.log('twentyFourHoursAgo: ', twentyFourHoursAgo);

    const latestOtp = await this.dbService.otp.findFirst({
      where: { 
        AND: [
          { userId },
          { createdAt: { gt: twentyFourHoursAgo } },
          { expiresAt: { gt: now } },
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('latestOtp: ', latestOtp);

    if (!latestOtp) {
      const max = Math.pow(10, 6);
      const randomNumber = crypto.randomInt(0, max);
      const pin = randomNumber.toString().padStart(6, '0');

      const payload: Prisma.OtpUncheckedCreateInput = {
        pin,
        resentCount: 0,
        expiresAt: new Date(now.getTime() + 60 * 60 * 24 * 1000),
        userId
      };

      const newOtp = await this.dbService.otp.create({
        data: payload
      });

      console.log('newOtp: ', newOtp);
      
    }

    return "";
  }  
}
