import { Module } from '@nestjs/common';
import { PenaltysNameService } from './penaltys-name.service';
import { PenaltysNameController } from './penaltys-name.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { WorkerService } from '../worker/worker.service';

@Module({
  controllers: [PenaltysNameController],
  providers: [PenaltysNameService, PrismaService, JwtService, WorkerService],
})
export class PenaltysNameModule {}
