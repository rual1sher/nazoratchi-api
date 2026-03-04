import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register({ ttl: 1000 * 60 * 1 })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtService],
})
export class AuthModule {}
