import { Controller, Post, Body, Param } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpValidateDto } from './dto/otp-validate.dto';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/request/:clientId')
  request(@Param('clientId') clientId: number) {
    return this.otpService.requestOtp(+clientId);
  }

  @Post('/validate')
  validate(@Body() otpDto: OtpValidateDto) {
    return this.otpService.validateOtp(otpDto);
  }
}
