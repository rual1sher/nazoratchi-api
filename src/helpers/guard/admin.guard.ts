import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { IRequest } from 'src/helpers/types/types';
import { ErrorMessages } from '../error/error.message';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<IRequest>();
    const user = request.user;

    if (user?.role !== 'admin') {
      throw new ForbiddenException(ErrorMessages.forbidden.adminOnly);
    }

    return true;
  }
}
