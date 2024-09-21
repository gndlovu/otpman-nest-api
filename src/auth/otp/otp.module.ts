import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { DatabaseModule } from '../../database/database.module';
import { MailerModule } from '../../mailer/mailer.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, ConfigModule, MailerModule, forwardRef(() => UsersModule)],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
