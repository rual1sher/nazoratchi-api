import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from '../types/types';

export const Owner = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<IRequest>();
  return req?.user;
});
