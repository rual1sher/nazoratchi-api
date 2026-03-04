import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { IRequest } from 'src/helpers/types/types';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<IRequest>();
    const user = request.user;

    if (user?.role !== 'admin') {
      throw new ForbiddenException('administrator access only');
    }

    return true;
  }
}
