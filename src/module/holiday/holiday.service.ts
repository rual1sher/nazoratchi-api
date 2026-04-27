import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IHolidayQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class HolidayService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHolidayDto: CreateHolidayDto) {
    return this.prisma.holiday.create({
      data: {
        name: createHolidayDto.name,
        description: createHolidayDto.description,
        date: new Date(createHolidayDto.date),
        yearly_loop: createHolidayDto.yearly_loop,
        filial_id: createHolidayDto.filial_id,
        department_id: createHolidayDto.department_id,
        position_id: createHolidayDto.position_id,
        schedule_id: createHolidayDto.schedule_id,
      },
    });
  }

  async findAll(query: IHolidayQuery) {
    const where: Prisma.holidayWhereInput = { deleted_at: null };

    if (query?.filialId) where.filial_id = +query.filialId;
    if (query?.departmentId) where.department_id = +query.departmentId;
    if (query?.positionId) where.position_id = +query.positionId;

    const count = await this.prisma.holiday.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const holiday = await this.prisma.holiday.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        filial: { select: { title_uz: true } },
        department: { select: { title_uz: true } },
        position: { select: { title_uz: true } },
        schedule: { select: { start_time: true, end_time: true } },
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { holiday, pagination };
  }

  async findOne(id: number) {
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, deleted_at: null },
      include: {
        filial: { select: { title_uz: true } },
        department: { select: { title_uz: true } },
        position: { select: { title_uz: true } },
        schedule: { select: { start_time: true, end_time: true } },
      },
    });
    if (!holiday) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Holiday'));
    }
    return holiday;
  }

  async update(id: number, updateHolidayDto: UpdateHolidayDto) {
    await this.findOne(id);
    return this.prisma.holiday.update({
      where: { id },
      data: {
        ...updateHolidayDto,
        date: updateHolidayDto.date ? new Date(updateHolidayDto.date) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.holiday.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
