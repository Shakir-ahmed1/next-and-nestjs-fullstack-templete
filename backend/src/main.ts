import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { COOKIE_SESSION_TOKEN } from './lib/auth/auth.config';
import { authDoc } from './lib/auth/auth.doc';
import { companyInfo } from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });


  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv === 'development' || nodeEnv === 'test') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(`${companyInfo.name} API`)
      .setDescription(`API documentation - Last Reload: ${new Date().toISOString()}`)
      .setVersion('1.0')
      .addServer(`http://localhost:${configService.get<number>('NGINX_PORT', 8080)}`, 'Local development server')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    document.paths = {
      ...document.paths,
      ...authDoc.paths,
    };

    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: `${companyInfo.name} API Docs`,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        displayRequestDuration: true,
        withCredentials: true,
      },
    });

    const port = configService.get<number>('BACKEND_PORT', 3007);
  }

  const port = configService.get<number>('BACKEND_PORT', 3007);
  await app.listen(port);
}
bootstrap();