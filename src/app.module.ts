import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { OtpModule } from './auth/otp/otp.module';
import { UsersModule } from './auth/users/users.module';

@Module({
  imports: [DatabaseModule, OtpModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
