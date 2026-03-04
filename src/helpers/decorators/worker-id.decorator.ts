import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WorkerId = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['x-worker-id'];
});
