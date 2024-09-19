import { Body, Controller, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('auth/users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('/signup')
    create(@Body() createUserDto: Prisma.UserCreateInput) {
        return this. userService.create(createUserDto);
    }
}
