import { MiddlewareConsumer, Module } from '@nestjs/common';

import { DatabaseModule } from './shared/database/database.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        UsersModule,
        MailerModule,
        AccountModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
