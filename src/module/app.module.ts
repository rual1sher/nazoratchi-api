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
import { PenaltyModule } from './penalty/penalty.module';
import { PaymentModule } from './payment/payment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SalaryModule } from './salary/salary.module';
import { TaskModule } from './task/task.module';
import { HolidayModule } from './holiday/holiday.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    WorkerModule,
    CompanyModule,
    FilialModule,
    DepartmentModule,
    PositionModule,
    DayModule,
    WorkerScheduleModule,
    PenaltyModule,
    PaymentModule,
    AttendanceModule,
    SalaryModule,
    HolidayModule,
    TaskModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
