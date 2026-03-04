import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { UserModule } from './user/user.module';
import { WorkerModule } from './worker/worker.module';
import { CompanyModule } from './company/company.module';
import { FilialModule } from './filial/filial.module';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';

@Module({
  imports: [AuthModule, UserModule, WorkerModule, CompanyModule, FilialModule, DepartmentModule, PositionModule],
  providers: [PrismaService],
})
export class AppModule {}
