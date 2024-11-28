import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const apiPrefix = configService.get<string>('API_PREFIX') || '';
    const port = configService.get<number>('PORT') || 8000;

    app.enableCors();
    app.setGlobalPrefix(apiPrefix);

    await app.listen(port);
}

bootstrap();
