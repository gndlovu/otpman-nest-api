import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from './shared/database/database.module';
import { OtpModule } from './auth/otp/otp.module';
import { UsersModule } from './auth/users/users.module';
import { MailerModule } from './mailer/mailer.module';
import { jwtConstants } from './shared/constants';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    DatabaseModule,
    OtpModule,
    UsersModule,
    MailerModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '300s' },
    }),
    AccountModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
