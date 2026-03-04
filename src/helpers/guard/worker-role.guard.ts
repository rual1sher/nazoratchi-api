import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { worker_role } from 'prisma/generated/prisma/enums';
import { WorkerService } from 'src/module/worker/worker.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IRequest } from '../types/types';

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
      throw new ForbiddenException('The user is not authenticated');
    }

    if (user.role === 'admin') {
      return true;
    }

    const workerId: string = request.headers['x-worker-id'];
    if (!workerId) {
      throw new ForbiddenException('Worker ID is required in headers.');
    }

    const worker = await this.workerService.findOneByUserAndWorker(
      +user.id,
      +workerId,
    );

    const hasRole = requireRoles.some((role) => worker.role === role);
    if (!hasRole) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
