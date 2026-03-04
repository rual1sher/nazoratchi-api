import { SetMetadata } from '@nestjs/common';
import { worker_role } from 'prisma/generated/prisma/enums';

export const ROLES_KEY = 'worker_roles';
export const WorkerRoles = (...roles: worker_role[]) =>
  SetMetadata(ROLES_KEY, roles);
