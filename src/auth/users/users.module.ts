import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../database/database.module';
import { MailerModule } from '../../mailer/mailer.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [DatabaseModule, ConfigModule, MailerModule, forwardRef(() => OtpModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {

}
