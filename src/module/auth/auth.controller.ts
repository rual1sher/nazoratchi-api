import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginPhoneDto } from './dto/login-phone.dto';
import { LoginUsernameDto } from './dto/login-username.dto';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { Request, Response } from 'express';
import { env } from 'src/helpers/config/env.config';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { IRequest } from 'src/helpers/types/types';
import { VerifyDto } from './dto/verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateAuthDto } from './dto/update.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with phone + password (old flow, sends OTP)' })
  @Post('login')
  async login(@Body() createAuthDto: LoginDto) {
    const data = await this.authService.login(createAuthDto);
    return new ApiResponse({ message: `send code = ${data}` });
  }

  @ApiOperation({ summary: 'Login with phone only → sends OTP to SMS' })
  @Post('login-phone')
  async loginPhone(@Body() dto: LoginPhoneDto) {
    const code = await this.authService.loginPhone(dto);
    return new ApiResponse({ message: `OTP sent`, code });
  }

  @ApiOperation({ summary: 'Login with username + password → returns tokens directly (no OTP)' })
  @Post('login-username')
  async loginUsername(@Body() dto: LoginUsernameDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.loginUsername(dto, res);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.node === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json(new ApiResponse({ accessToken }));
  }

  @Post('verify')
  async verify(@Body() verifyDto: VerifyDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.verify(verifyDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.node === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json(new ApiResponse({ accessToken }));
  }

  @Post('resend')
  async resend(@Body('phone') phone: string) {
    const data = await this.authService.resend(phone);
    return new ApiResponse({ message: `send code = ${data}` });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refreshToken'];
    const { accessToken, refreshToken } = await this.authService.refresh(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.node === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json(new ApiResponse({ accessToken }));
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refreshToken'];
    await this.authService.logout(token);

    res.clearCookie('refreshToken');
    return res.json(new ApiResponse({ message: 'Logged out successfully' }));
  }

  @Patch('change/password')
  @UseGuards(AuthGuard)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: IRequest) {
    await this.authService.changePassword(dto, req.user);
    return new ApiResponse({ message: 'Password changed successfully' });
  }

  @Post('change/phone')
  @UseGuards(AuthGuard)
  async changePhone(@Req() req: IRequest) {
    const data = await this.authService.changePhone(req.user);
    return new ApiResponse({ message: `send code = ${data}` });
  }

  @Patch('change/phone/verify')
  @UseGuards(AuthGuard)
  async changePhoneVerify(@Body() dto: VerifyDto, @Req() req: IRequest) {
    await this.authService.changePhoneVerify(dto, req.user);
    return new ApiResponse({ message: 'Phone changed successfully' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: IRequest) {
    const data = await this.authService.me(req.user);
    return new ApiResponse(data);
  }

  @Patch('update/me')
  @UseGuards(AuthGuard)
  async updateMe(@Body() dto: UpdateAuthDto, @Req() req: IRequest) {
    const data = await this.authService.updateMe(dto, req.user);
    return new ApiResponse(data);
  }
}
