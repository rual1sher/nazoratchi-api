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
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { Request, Response } from 'express';
import { env } from 'src/helpers/config/env.config';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { IRequest } from 'src/helpers/types/types';
import { VerifyDto } from './dto/verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() createAuthDto: LoginDto) {
    const data = await this.authService.login(createAuthDto);
    return new ApiResponse({ message: `send code = ${data}` });
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
    const data = await this.authService.changePassword(dto, req.user);
    return new ApiResponse({ message: 'Password changed successfully' });
  }

  @Patch('change/phone')
  @UseGuards(AuthGuard)
  async changePhone(@Body('new_phone') newPhone: string, @Req() req: IRequest) {
    const data = await this.authService.changePhone(newPhone, req.user);
    return new ApiResponse({ message: 'Phone changed successfully' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: IRequest) {
    const data = await this.authService.me(req.user);
    return new ApiResponse(data);
  }
}
