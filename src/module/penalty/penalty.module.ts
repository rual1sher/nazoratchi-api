import { Module } from '@nestjs/common';
import { PenaltyService } from './penalty.service';
import { PenaltyController } from './penalty.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';

@Module({
  controllers: [PenaltyController],
  providers: [PenaltyService, PrismaService, JwtService, WorkerService],
})
export class PenaltyModule {}
