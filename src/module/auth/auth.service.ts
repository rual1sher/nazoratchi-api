import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { checkPassword, hashingPassword } from 'src/helpers/hash/password';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { IPayload } from 'src/helpers/types/types';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { randomInt } from 'crypto';
import { VerifyDto } from './dto/verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ErrorMessages } from 'src/helpers/error/error.message';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(createAuthDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: createAuthDto.phone, deleted_at: null },
    });
    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidUser);
    }

    const isPasswordValid = checkPassword(
      createAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidUser);
    }

    const code = randomInt(100000, 999999);
    await this.cacheManager.set(`${user.phone}`, code);
    return code;
  }

  async verify({ code, phone }: VerifyDto) {
    const cacheCode = await this.cacheManager.get(`${phone}`);

    if (cacheCode !== code) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidCode);
    }

    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidUser);
    }

    const accessToken = this.jwtService.generateAccess({
      id: user.id,
      role: user.role,
    });
    const refreshToken = this.jwtService.generateRefresh({
      id: user.id,
      role: user.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token: refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    if (!token) {
      throw new BadRequestException(ErrorMessages.badRequest.requiredToken);
    }

    const data = this.jwtService.verifyRefresh(token);

    if (!data) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidToken);
    }

    const user = await this.prisma.user.findFirst({
      where: { id: data.id, token, deleted_at: null },
    });

    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidUser);
    }

    const accessToken = this.jwtService.generateAccess({
      id: user.id,
      role: user.role,
    });
    const refreshToken = this.jwtService.generateRefresh({
      id: user.id,
      role: user.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { token: refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException(ErrorMessages.badRequest.requiredToken);
    }

    const data = this.jwtService.verifyRefresh(token);

    if (!data) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidToken);
    }

    await this.prisma.user.update({
      where: { id: data.id, token },
      data: { token: null },
    });
  }

  async changePassword(dto: ChangePasswordDto, { id }: IPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user)
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('user'));

    const isPasswordValid = checkPassword(dto.old_password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException(ErrorMessages.badRequest.invalidPassword);
    }

    const password = hashingPassword(dto.new_password);
    await this.prisma.user.update({ where: { id }, data: { password } });
  }

  async changePhone(newPhone: string, { id }: IPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user)
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('User'));
    if (user.phone === newPhone) {
      throw new BadRequestException(ErrorMessages.badRequest.samePhone);
    }

    await this.prisma.user.update({ where: { id }, data: { phone: newPhone } });
  }

  async me(user: IPayload) {
    const data = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { worker: true },
      omit: { password: true, token: true },
    });

    return data;
  }
}
