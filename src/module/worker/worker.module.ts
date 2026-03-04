import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { PrismaService } from 'src/helpers/prisma/prisma.service';

@Module({
  controllers: [WorkerController],
  providers: [WorkerService, JwtService, PrismaService],
})
export class WorkerModule {}
