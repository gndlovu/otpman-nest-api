import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from './database/database.module';
import { OtpModule } from './auth/otp/otp.module';
import { UsersModule } from './auth/users/users.module';
import { MailerModule } from './mailer/mailer.module';
import { jwtConstants } from './shared/constants';

@Module({
  imports: [
    DatabaseModule, 
    OtpModule, 
    UsersModule, 
    MailerModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
