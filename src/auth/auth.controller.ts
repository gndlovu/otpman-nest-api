import {
    Body,
    Controller,
    HttpCode,
    Param,
    Post,
    UsePipes,
} from '@nestjs/common';
import { JoiValidationPipe } from 'src/shared/pipes/joi.pipe';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginSchema } from '../shared/schemas/login.schema';
import { OtpVerifySchema } from '../shared/schemas/otp-verify.schema';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UsePipes(new JoiValidationPipe(LoginSchema))
    @HttpCode(200)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @HttpCode(200)
    @Post('/otp/request/:clientId')
    request(@Param('clientId') clientId: number) {
        return this.authService.requestOtp(+clientId);
    }

    @UsePipes(new JoiValidationPipe(OtpVerifySchema))
    @HttpCode(200)
    @Post('otp/verify')
    verifyLogin(@Body() otpVerifyDto: OtpVerifyDto) {
        return this.authService.verifyOtp(otpVerifyDto);
    }
}
