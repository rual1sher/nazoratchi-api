import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './module/app.module';
import { env } from './helpers/config/env.config';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { join } from 'path';
import {
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
  ensureUploadDir,
} from './helpers/config/upload.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './helpers/error/http-exception.filter';
import { LoggingInterceptor } from './helpers/interceptors/logging.interceptor';

async function bootstrap() {
  const port = env.port;

  ensureUploadDir();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.use(cookieParser());
  app.useStaticAssets(join(UPLOAD_DIR), { prefix: UPLOAD_URL_PREFIX });

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Nazoratchi API')
    .setDescription('The Nazoratchi API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Paste accessToken from login (Swagger adds the Bearer prefix)',
    })
    // Without this, OpenAPI has no operation security → "Authorize" does not send Authorization
    .addSecurityRequirements('bearer')
    .addGlobalParameters({
      name: 'x-company-id',
      in: 'header',
      required: false,
      description: 'Company id for scoped routes (same as CompanyId decorator)',
      schema: { type: 'string', example: '1' },
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log('Starting server on port', port);
  console.log(
    `Swagger documentation available at http://localhost:${port}/api/docs`,
  );
}

bootstrap();
