import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { DatabaseModule } from '../../database/database.module';
import { MailerModule } from '../../mailer/mailer.module';

@Module({
  imports: [DatabaseModule, ConfigModule, MailerModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
