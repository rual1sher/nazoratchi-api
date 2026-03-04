import { BadRequestException, Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { env } from 'src/helpers/config/env.config';
import { IPayload } from 'src/helpers/types/types';

@Injectable()
export class JwtService {
  generateAccess(data: IPayload) {
    const secret = env.jwt.accessSecret;
    const expiresIn: any = env.jwt.accessExpiresIn || '15m';

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    return sign(data, secret, { expiresIn });
  }

  generateRefresh(data: IPayload) {
    const secret = env.jwt.refreshSecret;
    const expiresIn: any = env.jwt.refreshExpiresIn || '7d';

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    return sign(data, secret, { expiresIn });
  }

  verifyAccess(token: string): IPayload | null {
    const secret = env.jwt.accessSecret;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    try {
      return verify(token, secret) as IPayload;
    } catch (err) {
      throw new BadRequestException(err?.message);
    }
  }

  verifyRefresh(token: string): IPayload {
    const secret = env.jwt.refreshSecret;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    try {
      return verify(token, secret) as IPayload;
    } catch (err) {
      throw new BadRequestException(err?.message);
    }
  }
}
