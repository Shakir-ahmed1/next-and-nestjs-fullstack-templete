import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth/auth';
import { BETTER_AUTH_URI, NEXT_PUBLIC_BACKEND_PORT } from '../config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    // { bodyParser: false }
  );
  app.useGlobalPipes(new ValidationPipe());
  const server = app.getHttpAdapter().getInstance();

  // Handle Better-Auth routes
  server.all(`${BETTER_AUTH_URI}/*path`, (req, res) => {
    // 1. Manually set CORS headers for this specific handler
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // 2. Handle the Preflight (OPTIONS) request immediately
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // 3. Pass to Better-Auth
    return toNodeHandler(auth)(req, res);
  });

  // Keep this for your standard NestJS Controllers
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  await app.listen(NEXT_PUBLIC_BACKEND_PORT);
  console.log(`Backend is running on port ${NEXT_PUBLIC_BACKEND_PORT}`);
}
bootstrap();