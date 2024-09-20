import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';

@Controller('auth/users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Post('/signup')
    create(@Body() createUserDto: Prisma.UserCreateInput) {
        return this.userService.create(createUserDto);
    }

    @Post('/login')
    login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto);
    }

    @UseGuards(AuthGuard)
    @Get('/me')
    profile(@Request() request) {
        return request.user;
    }
}
