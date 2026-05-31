import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IScheduleQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { parseTimeToDate } from 'src/helpers/validate/parse-time';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class WorkerScheduleService {
  constructor(private prisma: PrismaService) {}

  private formatTimeUTC(value: Date | null | undefined) {
    if (!value) return null;
    const hh = String(value.getUTCHours()).padStart(2, '0');
    const mm = String(value.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private formatDateUTC(value: Date | null | undefined) {
    if (!value) return null;
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async create(dto: CreateWorkerScheduleDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    return await this.prisma.$transaction(async (tx) => {
      const schedule = await tx.worker_schedule.create({
        data: {
          company_id: cId,
          name: dto.name,
          type: dto.type,
          starts_at: new Date(dto.startsAt),
          days_frequency: dto.daysFrequency,
        },
      });

      Array.isArray(dto.days) &&
        (await tx.day.createMany({
          data: dto.days.map((day) => ({
            day: day.day,
            start_time: parseTimeToDate(day.start, 'start'),
            end_time: parseTimeToDate(day.end, 'end'),
            break_start: day.breakStart
              ? parseTimeToDate(day.breakStart, 'breakStart')
              : undefined,
            break_end: day.breakEnd
              ? parseTimeToDate(day.breakEnd, 'breakEnd')
              : undefined,
            schedule_id: schedule.id,
          })),
        }));

      return tx.worker_schedule.findUnique({
        where: { id: schedule.id },
        include: { days: true },
      });
    });
  }

  async findAll(query: IScheduleQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.worker_scheduleWhereInput = {
      deleted_at: null,
      company_id: cId,
    };
    if (query?.workerId) {
      where.workers = { some: { id: +query.workerId, company_id: cId } };
    }

    const count = await this.prisma.worker_schedule.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const schedule = await this.prisma.worker_schedule.findMany({
      where,
      include: {
        days: { where: { deleted_at: null }, orderBy: { day: 'asc' } },
      },
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { created_at: 'desc' },
    });

    return { schedule, pagination };
  }

  async findAllWorkScheduleTemplates(
    query: IScheduleQuery,
    companyId: number | null,
  ) {
    const { schedule, pagination } = await this.findAll(query, companyId);
    const templates = schedule.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      startsAt: this.formatDateUTC(item.starts_at),
      days: item.days.map((day) => ({
        id: day.id,
        day: day.day,
        start: this.formatTimeUTC(day.start_time),
        end: this.formatTimeUTC(day.end_time),
        breakStart: this.formatTimeUTC(day.break_start),
        breakEnd: this.formatTimeUTC(day.break_end),
      })),
    }));
    return { templates, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const data = await this.prisma.worker_schedule.findFirst({
      where: { id, deleted_at: null, company_id: cId },
    });

    if (!data) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound("Worker's Schedule"),
      );
    }

    return data;
  }

  async findOneWorkScheduleTemplateFromRowId(
    id: number,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);
    const row = await this.prisma.worker_schedule.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: {
        days: { where: { deleted_at: null }, orderBy: { day: 'asc' } },
      },
    });

    if (!row) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound("Worker's Schedule"),
      );
    }

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      startsAt: this.formatDateUTC(row.starts_at),
      days: row.days.map((day) => ({
        id: day.id,
        day: day.day,
        start: this.formatTimeUTC(day.start_time),
        end: this.formatTimeUTC(day.end_time),
        breakStart: this.formatTimeUTC(day.break_start),
        breakEnd: this.formatTimeUTC(day.break_end),
      })),
    };
  }

  async update(
    id: number,
    dto: UpdateWorkerScheduleDto,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);
    const data = await this.prisma.worker_schedule.findFirst({
      where: { id, deleted_at: null, company_id: cId },
    });
    if (!data) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound("Worker's Schedule"),
      );
    }

    const updateScheduleDto: Prisma.worker_scheduleUncheckedUpdateInput = {
      name: dto.name,
      type: dto.type,
      starts_at: dto.startsAt ? new Date(dto.startsAt) : undefined,
      ...(dto.daysFrequency && { days_frequency: dto.daysFrequency }),
    };

    return await this.prisma.$transaction(async (tx) => {
      await tx.worker_schedule.update({
        where: { id },
        data: updateScheduleDto,
      });

      if (dto.days) {
        await tx.day.updateMany({
          where: { schedule_id: id, deleted_at: null },
          data: { deleted_at: new Date() },
        });

        if (Array.isArray(dto.days)) {
          await tx.day.createMany({
            data: dto.days.map((day) => ({
              day: day.day!,
              start_time: parseTimeToDate(day.start!, 'start'),
              end_time: parseTimeToDate(day.end!, 'end'),
              break_start: day.breakStart
                ? parseTimeToDate(day.breakStart, 'breakStart')
                : undefined,
              break_end: day.breakEnd
                ? parseTimeToDate(day.breakEnd, 'breakEnd')
                : undefined,
              schedule_id: id,
            })),
          });
        }
      }

      return tx.worker_schedule.findUnique({
        where: { id },
        include: {
          days: { where: { deleted_at: null }, orderBy: { day: 'asc' } },
        },
      });
    });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const data = await this.prisma.worker_schedule.findFirst({
      where: { id, deleted_at: null, company_id: cId },
    });
    if (!data) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound("Worker's Schedule"),
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.day.updateMany({
        where: { schedule_id: id, deleted_at: null },
        data: { deleted_at: new Date() },
      });

      return tx.worker_schedule.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    });
  }
}
