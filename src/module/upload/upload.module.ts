import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';
import { PrismaService } from 'src/helpers/prisma/prisma.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, JwtService, WorkerService, PrismaService],
  exports: [UploadService],
})
export class UploadModule {}
