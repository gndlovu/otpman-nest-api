import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { DatabaseModule } from '../../database/database.module';
import { MailerModule } from '../../mailer/mailer.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, ConfigModule, MailerModule, UsersModule],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
