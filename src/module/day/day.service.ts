import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { UpdateDayDto } from './dto/update-day.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IDayQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { validateRelations } from 'src/helpers/validate/validate-relations';

@Injectable()
export class DayService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDayDto, _workerId: number) {
    await validateRelations(this.prisma, { schedule_id: dto.schedule_id });

    return await this.prisma.day.create({ data: dto });
  }

  async findAll(query: IDayQuery, _workerId: number) {
    const where: Prisma.dayWhereInput = { deleted_at: null };
    if (query?.scheduleId) where.schedule_id = +query.scheduleId;

    if (query.search) {
      const day = Number(query.search);
      if (day >= 1 && day <= 7) {
        where.day = day;
      }
    }

    const count = await this.prisma.day.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const day = await this.prisma.day.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { day, pagination };
  }

  async findOne(id: number) {
    const day = await this.prisma.day.findUnique({
      where: { id, deleted_at: null },
    });
    if (!day) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Day'));
    }

    return day;
  }

  async update(id: number, dto: UpdateDayDto, _workerId: number) {
    const day = await this.prisma.day.findUnique({
      where: { id, deleted_at: null },
    });
    if (!day) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Day'));
    }

    if (dto?.schedule_id) await validateRelations(this.prisma, dto);

    return await this.prisma.day.update({ where: { id }, data: dto });
  }

  async remove(id: number, _workerId: number) {
    const where: Prisma.dayWhereInput = { id, deleted_at: null };

    const day = await this.prisma.day.findFirst({ where });
    if (!day) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Day'));
    }

    return await this.prisma.day.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
