import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from '../shared/utils/constants';
import { MailerModule } from '../shared/mailer/mailer.module';
import { DatabaseModule } from '../shared/database/database.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        DatabaseModule,
        ConfigModule,
        MailerModule,
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '300s' },
        }),
    ],
})
export class AuthModule {}
