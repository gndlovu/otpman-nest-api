import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OtpService } from './otp.service';
import { Prisma } from '@prisma/client';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post(':clientId')
  generate(@Param('clientId') clientId: number) {
    return this.otpService.generateOtp(+clientId);
  }
}
