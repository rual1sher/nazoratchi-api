import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ErrorMessages } from '../error/error.message';
import { IRequest } from '../types/types';

export const WorkerId = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<IRequest>();

  if (req.user?.role === 'admin') {
    return null;
  }

  if (req.workerId != null) {
    return req.workerId;
  }

  throw new BadRequestException(
    ErrorMessages.badRequest.invalid(
      'Worker id is missing. Use WorkerRolesGuard before @WorkerId()',
    ),
  );
});
