import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, JwtService, WorkerService],
})
export class PaymentModule {}
