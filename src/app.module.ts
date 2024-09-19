import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { OtpModule } from './auth/otp/otp.module';
import { UsersModule } from './auth/users/users.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [DatabaseModule, OtpModule, UsersModule, MailerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
