import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { ITaskQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
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
          select: { id: true, user: { select: { first_name: true, last_name: true } } },
        },
      },
    });
  }

  async findAll(query: ITaskQuery) {
    const where: Prisma.taskWhereInput = { deleted_at: null };

    if (query?.workerId) where.workers = { some: { id: +query.workerId } };

    const count = await this.prisma.task.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const task = await this.prisma.task.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        workers: {
          select: { id: true, user: { select: { first_name: true, last_name: true } } },
        },
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { task, pagination };
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findFirst({
      where: { id, deleted_at: null },
      include: {
        workers: {
          select: { id: true, user: { select: { first_name: true, last_name: true } } },
        },
      },
    });
    if (!task) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Task'));
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);
    
    // Disconnect all existing workers and connect new ones if employee_ids is provided
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
          select: { id: true, user: { select: { first_name: true, last_name: true } } },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
