import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { LoginPhoneDto } from './dto/login-phone.dto';
import { LoginUsernameDto } from './dto/login-username.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { checkPassword, hashingPassword } from 'src/helpers/hash/password';
import { JwtService } from 'src/helpers/jwt/jwt.service';
import { IPayload } from 'src/helpers/types/types';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { randomInt } from 'crypto';
import { VerifyDto } from './dto/verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { UpdateAuthDto } from './dto/update.dto';

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
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
    }

    const isPasswordValid = checkPassword(
      createAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
    }

    const code = randomInt(100000, 999999);
    await this.cacheManager.set(`login-${user.phone}`, code);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: false },
    });
    return code;
  }

  // Способ 1: Phone → OTP (без пароля)
  async loginPhone(dto: LoginPhoneDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone, deleted_at: null },
    });
    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
    }

    const code = randomInt(100000, 999999);
    await this.cacheManager.set(`login-${user.phone}`, code);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: false },
    });
    return code;
  }

  // Способ 2: Username + Password → сразу токены (без OTP)
  async loginUsername(dto: LoginUsernameDto, res: any) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, deleted_at: null },
    });
    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
    }

    const isPasswordValid = checkPassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException(
        ErrorMessages.badRequest.invalid('Password'),
      );
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
      data: { token: refreshToken, isVerified: true },
    });

    return { accessToken, refreshToken };
  }

  async verify({ code, phone }: VerifyDto) {
    const cacheCode = await this.cacheManager.get(`login-${phone}`);

    if (cacheCode !== code) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('Code'));
    }

    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
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
      data: { token: refreshToken, isVerified: true },
    });

    return { accessToken, refreshToken };
  }

  async resend(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone, deleted_at: null, isVerified: false },
    });
    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
    }

    const code = randomInt(100000, 999999);
    await this.cacheManager.set(`login-${user.phone}`, code);
    return code;
  }

  async refresh(token: string) {
    if (!token) {
      throw new BadRequestException(ErrorMessages.badRequest.requiredToken);
    }

    const data = this.jwtService.verifyRefresh(token);

    if (!data) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('Token'));
    }

    const user = await this.prisma.user.findFirst({
      where: { id: data.id, token, deleted_at: null },
    });

    if (!user) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('User'));
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
      throw new BadRequestException(ErrorMessages.badRequest.invalid('Token'));
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
      throw new BadRequestException(
        ErrorMessages.badRequest.invalid('Password'),
      );
    }

    const password = hashingPassword(dto.new_password);
    await this.prisma.user.update({ where: { id }, data: { password } });
  }

  async changePhone({ id }: IPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('User'));
    }

    const code = randomInt(100000, 999999);
    await this.cacheManager.set(`change-phone-${user.phone}`, code);
    return code;
  }

  async changePhoneVerify(dto: VerifyDto, { id }: IPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('User'));
    }

    const code = await this.cacheManager.get(`change-phone-${user.phone}`);
    if (code !== dto.code) {
      throw new BadRequestException(ErrorMessages.badRequest.invalid('Code'));
    }

    if (user.phone === dto.phone) {
      throw new BadRequestException(ErrorMessages.badRequest.samePhone);
    }

    await this.prisma.user.update({
      where: { id },
      data: { phone: dto.phone },
    });
  }

  async me(user: IPayload) {
    const data = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        worker: { include: { company: { include: { filial: true } } } },
      },
      omit: { password: true, token: true },
    });

    return data;
  }

  async updateMe(dto: UpdateAuthDto, { id }: IPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('User'));
    }

    return await this.prisma.user.update({ where: { id }, data: dto });
  }
}
