import { Module } from '@nestjs/common';
import { FilialService } from './filial.service';
import { FilialController } from './filial.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';

@Module({
  controllers: [FilialController],
  providers: [FilialService, PrismaService, JwtService],
})
export class FilialModule {}
