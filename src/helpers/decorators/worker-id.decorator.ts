import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WorkerId = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (request?.user?.role === 'admin') {
    return null;
  }

  return request.headers['x-worker-id'];
});
