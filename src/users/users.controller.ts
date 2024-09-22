import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/shared/guards/auth/auth.guard';

@Controller('users')
export class UsersController {
    @UseGuards(AuthGuard)
    @Get('/profile')
    profile(@Request() request) {
        return request.user;
    }
}
