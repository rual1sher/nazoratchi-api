import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { env } from './helpers/config/env.config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = env.port;

  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log('starting server on port', port);
}

bootstrap();
