import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  if (configService.get('NODE_ENV') === 'development') {
    // Swagger/OpenAPI setup
    const config = new DocumentBuilder()
      .setTitle('Twin Commerce API')
      .setDescription('API documentation for Twin Commerce backend')
      .setVersion('1.0')
      .addTag('todos', 'Todo management endpoints')
      .addServer(`http://localhost:${configService.get<number>('BACKEND_PORT', 3000)}`, 'Local development server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Twin Commerce API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
    const port = configService.get<number>('BACKEND_PORT', 3000);
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  }
  // Read your backend port from environment
  const port = configService.get<number>('BACKEND_PORT', 3000);

  await app.listen(port);
  logger.log(`Backend is running on port ${port}`);
}
bootstrap();