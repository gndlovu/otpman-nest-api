import { Injectable, Logger, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: any, res: any, next: (error?: Error | any) => void) {
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';
        
        res.on('finish', () => {
            const { statusCode } = res;
            const conentLen = res.get('content-length');

            this.logger.log(`${method} ${originalUrl} ${statusCode} ${conentLen} - ${userAgent} ${ip}`);
        });

        next();
    }
}