import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { IRequest } from 'src/helpers/types/types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<IRequest>();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = this.jwtService.verifyAccess(token);

    if (!payload) {
      throw new UnauthorizedException();
    }

    request.user = payload;
    return true;
  }
}
