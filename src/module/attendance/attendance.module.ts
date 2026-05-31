import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { FaceIdAttendanceController } from './face-id-attendance.controller';
import { AttendancePenaltyCron } from './attendance-penalty.cron';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';

@Module({
  controllers: [AttendanceController, FaceIdAttendanceController],
  providers: [
    AttendanceService,
    AttendancePenaltyCron,
    PrismaService,
    JwtService,
    WorkerService,
  ],
})
export class AttendanceModule {}
