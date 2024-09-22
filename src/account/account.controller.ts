import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { JoiValidationPipe } from '../shared/pipes/joi.pipe';
import { AccountService } from './account.service';
import { SignupSchema } from '../shared/schemas/signup.schema';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

  @Post('signup')
  @UsePipes(new JoiValidationPipe(SignupSchema))
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.accountService.signUp(createUserDto);
  }
}
