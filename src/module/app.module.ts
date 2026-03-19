import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { UserModule } from './user/user.module';
import { WorkerModule } from './worker/worker.module';
import { CompanyModule } from './company/company.module';
import { FilialModule } from './filial/filial.module';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';
import { DayModule } from './day/day.module';
import { WorkerScheduleModule } from './worker-schedule/worker-schedule.module';
import { PenaltysNameModule } from './penaltys-name/penaltys-name.module';
import { PenaltyModule } from './penalty/penalty.module';

@Module({
  imports: [AuthModule, UserModule, WorkerModule, CompanyModule, FilialModule, DepartmentModule, PositionModule, DayModule, WorkerScheduleModule, PenaltysNameModule, PenaltyModule],
  providers: [PrismaService],
})
export class AppModule {}
