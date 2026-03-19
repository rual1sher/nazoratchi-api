import { createParamDecorator } from '@nestjs/common';

export const CompanyId = createParamDecorator((_, ctx): number | null => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers['x-company-id']
    ? Number(req.headers['x-company-id'])
    : null;
});
