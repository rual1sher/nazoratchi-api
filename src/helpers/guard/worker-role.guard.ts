import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { worker_role } from 'prisma/generated/prisma/enums';
import { WorkerService } from 'src/module/worker/worker.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IRequest } from '../types/types';
import { ErrorMessages } from '../error/error.message';

@Injectable()
export class WorkerRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workerService: WorkerService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requireRoles = this.reflector.getAllAndOverride<worker_role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireRoles || !requireRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IRequest>();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException(
        ErrorMessages.unauthorized.noAuthorization,
      );
    }

    if (user.role === 'admin') {
      return true;
    }

    const companyId: string = request.headers['x-company-id'];
    if (!companyId) {
      throw new ForbiddenException(ErrorMessages.forbidden.noCompanyId);
    }

    const worker = await this.workerService.findOneByUserAndCompany(
      +user.id,
      +companyId,
    );

    const hasRole = requireRoles.some((role) => worker.role === role);
    if (!hasRole) {
      throw new ForbiddenException(ErrorMessages.forbidden.accessDenied);
    }

    return true;
  }
}
