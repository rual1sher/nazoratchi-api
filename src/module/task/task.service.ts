import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { ITaskQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.assertWorkersBelongToCompany(cId, createTaskDto.employee_ids);

    return this.prisma.task.create({
      data: {
        company_id: cId,
        name: createTaskDto.name,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        status: createTaskDto.status,
        workers: {
          connect: createTaskDto.employee_ids.map((id) => ({ id })),
        },
      },
      include: {
        workers: {
          select: {
            id: true,
            user: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });
  }

  async findAll(query: ITaskQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.taskWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query?.workerId) {
      where.workers = { some: { id: +query.workerId, company_id: cId } };
    }

    const count = await this.prisma.task.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const task = await this.prisma.task.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        workers: {
          select: {
            id: true,
            user: { select: { first_name: true, last_name: true } },
          },
        },
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { task, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const task = await this.prisma.task.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: {
        workers: {
          select: {
            id: true,
            user: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });
    if (!task) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Task'));
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    if (updateTaskDto.employee_ids?.length) {
      await this.assertWorkersBelongToCompany(cId, updateTaskDto.employee_ids);
    }

    const workersUpdate = updateTaskDto.employee_ids
      ? { set: updateTaskDto.employee_ids.map((workerId) => ({ id: workerId })) }
      : undefined;

    return this.prisma.task.update({
      where: { id },
      data: {
        name: updateTaskDto.name,
        description: updateTaskDto.description,
        priority: updateTaskDto.priority,
        status: updateTaskDto.status,
        workers: workersUpdate,
      },
      include: {
        workers: {
          select: {
            id: true,
            user: { select: { first_name: true, last_name: true } },
          },
        },
      },
    });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);
    return this.prisma.task.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  private async assertWorkersBelongToCompany(
    companyId: number,
    workerIds: number[],
  ): Promise<void> {
    const workers = await this.prisma.worker.findMany({
      where: {
        id: { in: workerIds },
        company_id: companyId,
        deleted_at: null,
      },
      select: { id: true },
    });
    if (workers.length !== workerIds.length) {
      throw new BadRequestException(
        'One or more workers are invalid or belong to another company',
      );
    }
  }
}
