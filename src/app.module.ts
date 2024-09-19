import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { OtpModule } from './auth/otp/otp.module';

@Module({
  imports: [DatabaseModule, OtpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
