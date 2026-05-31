import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import {
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
} from 'src/helpers/config/upload.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: UPLOAD_DIR,
      serveRoot: UPLOAD_URL_PREFIX,
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Allow-Methods', 'GET');
          res.set('Access-Control-Allow-Headers', 'Content-Type');
        },
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, JwtService, WorkerService, PrismaService],
  exports: [UploadService],
})
export class UploadModule {}
