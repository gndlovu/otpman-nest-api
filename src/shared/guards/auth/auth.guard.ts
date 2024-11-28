import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/shared/utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.getAuthToken(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const results = await this.jwtService.verifyAsync(token, {
                secret: jwtConstants.secret,
            });

            // TODO - No need to do this here, call a method from a service to return all data needed.
            request['user'] = results;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    private getAuthToken(request: Request): string {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        return 'Bearer' === type ? token : null;
    }
}
