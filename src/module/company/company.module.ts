import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService, JwtService],
})
export class CompanyModule {}
