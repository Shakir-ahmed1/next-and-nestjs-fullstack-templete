import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  // Read your backend port from environment
  const port = configService.get<number>('NEXT_PUBLIC_BACKEND_PORT', 3000);

  await app.listen(port);
  logger.log(`Backend is running on port ${port}`);
}
bootstrap();