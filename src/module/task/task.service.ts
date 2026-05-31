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
    await this.assertWorkersBelongToCompany(cId, createTaskDto.workers_ids);

    const { row } = (await this.prisma.task.findFirst({
      where: { company_id: cId, deleted_at: null, col: createTaskDto.col },
      orderBy: { row: 'desc' },
      select: { row: true },
    })) || { row: 0 };

    return this.prisma.task.create({
      data: {
        company_id: cId,
        name: createTaskDto.name,
        description: createTaskDto.description,
        priority: createTaskDto.priority,
        col: createTaskDto.col,
        row: row,
        file: createTaskDto.file ?? null,
        workers: {
          connect: createTaskDto.workers_ids.map((id) => ({ id })),
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

  async findAll(
    query: ITaskQuery,
    companyId: number | null,
    workerId: number | null,
  ) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.taskWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query?.workerId && !workerId) {
      where.workers = { some: { id: +query.workerId, company_id: cId } };
    }
    if (workerId) {
      where.workers = { some: { id: workerId, company_id: cId } };
    }

    const count = await this.prisma.task.count({ where });
    const pagination = new Pagination(count, query.page, query.limit ?? 9999);

    const task = await this.prisma.task.findMany({
      where,
      orderBy: { row: 'asc' },
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

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);
    const existing = await this.findOne(id, cId);

    if (updateTaskDto.workers_ids?.length) {
      await this.assertWorkersBelongToCompany(cId, updateTaskDto.workers_ids);
    }

    const workersUpdate = updateTaskDto.workers_ids
      ? { set: updateTaskDto.workers_ids.map((workerId) => ({ id: workerId })) }
      : undefined;

    const newCol = updateTaskDto.col ?? existing.col;
    const newRow = updateTaskDto.row ?? existing.row;
    const rowChanged =
      updateTaskDto.row !== undefined && updateTaskDto.row !== existing.row;
    const colChanged =
      updateTaskDto.col !== undefined && updateTaskDto.col !== existing.col;

    return this.prisma.$transaction(async (tx) => {
      if (colChanged) {
        await tx.task.updateMany({
          where: {
            company_id: cId,
            deleted_at: null,
            col: existing.col,
            row: { gt: existing.row },
            id: { not: id },
          },
          data: { row: { decrement: 1 } },
        });

        await tx.task.updateMany({
          where: {
            company_id: cId,
            deleted_at: null,
            col: newCol,
            row: { gte: newRow },
            id: { not: id },
          },
          data: { row: { increment: 1 } },
        });
      } else if (rowChanged) {
        if (newRow < existing.row) {
          await tx.task.updateMany({
            where: {
              company_id: cId,
              deleted_at: null,
              col: existing.col,
              row: { gte: newRow, lt: existing.row },
              id: { not: id },
            },
            data: { row: { increment: 1 } },
          });
        } else {
          await tx.task.updateMany({
            where: {
              company_id: cId,
              deleted_at: null,
              col: existing.col,
              row: { gt: existing.row, lte: newRow },
              id: { not: id },
            },
            data: { row: { decrement: 1 } },
          });
        }
      }

      return tx.task.update({
        where: { id },
        data: {
          name: updateTaskDto.name,
          description: updateTaskDto.description,
          priority: updateTaskDto.priority,
          col: updateTaskDto.col,
          row: updateTaskDto.row,
          file: updateTaskDto.file,
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
