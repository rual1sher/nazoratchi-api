import { Module } from '@nestjs/common';
import { WorkerScheduleService } from './worker-schedule.service';
import { WorkerScheduleController } from './worker-schedule.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';

@Module({
  controllers: [WorkerScheduleController],
  providers: [WorkerScheduleService, PrismaService, JwtService, WorkerService],
})
export class WorkerScheduleModule {}
