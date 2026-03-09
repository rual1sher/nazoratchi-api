import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IScheduleQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';

@Injectable()
export class WorkerScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkerScheduleDto) {
    if (dto?.day_id) {
      const day = await this.prisma.day.findUnique({
        where: { id: dto.day_id, deleted_at: null },
      });

      if (!day) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Day'),
        );
      }
    }

    return await this.prisma.worker_schedule.create({ data: dto });
  }

  async findAll(query: IScheduleQuery) {
    const where: Prisma.worker_scheduleWhereInput = { deleted_at: null };
    if (query?.dayId) where.day_id = +query.dayId;

    const count = await this.prisma.worker_schedule.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const schedule = await this.prisma.worker_schedule.findMany({
      where,
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { created_at: 'desc' },
    });

    return { schedule, pagination };
  }

  async update(id: number, dto: UpdateWorkerScheduleDto) {
    const where: Prisma.worker_scheduleWhereInput = { id, deleted_at: null };

    const data = await this.prisma.worker_schedule.findFirst({ where });
    if (!data) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound("Worker's Schedule"),
      );
    }

    if (dto?.day_id) {
      const day = await this.prisma.day.findUnique({
        where: { id: dto.day_id, deleted_at: null },
      });

      if (!day) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Day'),
        );
      }
    }

    return await this.prisma.worker_schedule.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const where: Prisma.worker_scheduleWhereInput = { id, deleted_at: null };

    const data = await this.prisma.worker_schedule.findFirst({ where });
    if (!data) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound("Worker's Schedule"),
      );
    }

    return await this.prisma.worker_schedule.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
