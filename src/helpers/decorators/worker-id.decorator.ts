import { createParamDecorator } from '@nestjs/common';
import { ErrorMessages } from '../error/error.message';

export const WorkerId = createParamDecorator(async (_, ctx) => {
  const req = ctx.switchToHttp().getRequest();

  if (req.user?.role === 'admin') {
    return null;
  }

  const companyId = Number(req.headers['x-company-id']);
  const userId = req.user?.id;

  if (!companyId || !userId) {
    throw ErrorMessages.badRequest.invalid('companyId or user');
  }

  const prisma = req.app.get('PrismaService');

  const worker = await prisma.worker.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
    },
    select: { id: true },
  });

  return worker?.id ?? null;
});
