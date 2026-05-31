import { createParamDecorator } from '@nestjs/common';
import { parseCompanyIdHeader } from '../company/require-company-id';

export const CompanyId = createParamDecorator((_, ctx): number => {
  const req = ctx.switchToHttp().getRequest();
  return parseCompanyIdHeader(req.headers['x-company-id']);
});
