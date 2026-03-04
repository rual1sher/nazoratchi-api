import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { PrismaService } from 'src/helpers/prisma/prisma.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService, PrismaService],
})
export class UserModule {}
