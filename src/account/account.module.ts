import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { DatabaseModule } from '../shared/database/database.module';
import { MailerModule } from '../shared/mailer/mailer.module';

@Module({
    imports: [DatabaseModule, ConfigModule, MailerModule],
    controllers: [AccountController],
    providers: [AccountService],
})
export class AccountModule {}
