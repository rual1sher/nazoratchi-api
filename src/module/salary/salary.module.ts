import { Module } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';

@Module({
  controllers: [SalaryController],
  providers: [SalaryService, PrismaService],
})
export class SalaryModule {}
