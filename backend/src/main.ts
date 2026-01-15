import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NEXT_PUBLIC_BACKEND_PORT } from '../config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  await app.listen(NEXT_PUBLIC_BACKEND_PORT);
  console.log(`Backend is running on port ${NEXT_PUBLIC_BACKEND_PORT}`);
}
bootstrap();