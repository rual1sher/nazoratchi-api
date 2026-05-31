import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IHolidayQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { requireCompanyId } from 'src/helpers/company/require-company-id';
import { worker_schedule_type } from 'prisma/generated/prisma/enums';

type WorkerScheduleType =
  (typeof worker_schedule_type)[keyof typeof worker_schedule_type];

const holidayInclude = {
  holiday_filials: {
    include: { filial: { select: { id: true, name: true } } },
  },
  holiday_departments: {
    include: {
      department: { select: { id: true, title_uz: true, title_ru: true } },
    },
  },
  holiday_schedule_scopes: {
    select: { type: true },
  },
} as const;

function uniqInts(ids: number[] | undefined): number[] {
  if (!ids?.length) return [];
  return [...new Set(ids)];
}

function uniqScheduleTypes(types: WorkerScheduleType[] | undefined): WorkerScheduleType[] {
  if (!types?.length) return [];
  return [...new Set(types)];
}

@Injectable()
export class HolidayService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHolidayDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const filialIds = uniqInts(dto.filial_ids);
    const departmentIds = uniqInts(dto.department_ids);
    const scheduleTypes = uniqScheduleTypes(dto.schedule_types);
    await this.assertFilialIds(cId, filialIds);
    await this.assertDepartmentIds(cId, departmentIds);

    return this.prisma.holiday.create({
      data: {
        company_id: cId,
        name: dto.name,
        description: dto.description,
        date: new Date(dto.date),
        yearly_loop: dto.yearly_loop ?? false,
        ...(filialIds.length && {
          holiday_filials: {
            create: filialIds.map((filial_id) => ({ filial_id })),
          },
        }),
        ...(departmentIds.length && {
          holiday_departments: {
            create: departmentIds.map((department_id) => ({ department_id })),
          },
        }),
        ...(scheduleTypes.length && {
          holiday_schedule_scopes: {
            create: scheduleTypes.map((type) => ({ type })),
          },
        }),
      },
      include: holidayInclude,
    });
  }

  async findAll(query: IHolidayQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.holidayWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query?.filialId) {
      where.holiday_filials = { some: { filial_id: +query.filialId } };
    }
    if (query?.departmentId) {
      where.holiday_departments = {
        some: { department_id: +query.departmentId },
      };
    }
    if (query?.scheduleType) {
      const t = query.scheduleType as WorkerScheduleType;
      if (!Object.values(worker_schedule_type).includes(t)) {
        throw new BadRequestException('Invalid scheduleType query');
      }
      where.holiday_schedule_scopes = { some: { type: t } };
    }

    const count = await this.prisma.holiday.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const holiday = await this.prisma.holiday.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: holidayInclude,
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { holiday, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: holidayInclude,
    });
    if (!holiday) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Holiday'),
      );
    }
    return holiday;
  }

  async update(id: number, dto: UpdateHolidayDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    const filialIds =
      dto.filial_ids !== undefined ? uniqInts(dto.filial_ids) : null;
    const departmentIds =
      dto.department_ids !== undefined ? uniqInts(dto.department_ids) : null;
    const scheduleTypes =
      dto.schedule_types !== undefined
        ? uniqScheduleTypes(dto.schedule_types)
        : null;

    if (filialIds !== null) await this.assertFilialIds(cId, filialIds);
    if (departmentIds !== null) await this.assertDepartmentIds(cId, departmentIds);

    const data: Prisma.holidayUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.yearly_loop !== undefined) data.yearly_loop = dto.yearly_loop;

    if (filialIds !== null) {
      data.holiday_filials = {
        deleteMany: {},
        create: filialIds.map((filial_id) => ({ filial_id })),
      };
    }
    if (departmentIds !== null) {
      data.holiday_departments = {
        deleteMany: {},
        create: departmentIds.map((department_id) => ({ department_id })),
      };
    }
    if (scheduleTypes !== null) {
      data.holiday_schedule_scopes = {
        deleteMany: {},
        create: scheduleTypes.map((type) => ({ type })),
      };
    }

    return this.prisma.holiday.update({
      where: { id },
      data,
      include: holidayInclude,
    });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);
    return this.prisma.holiday.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  private async assertFilialIds(
    companyId: number,
    filialIds: number[],
  ): Promise<void> {
    for (const filial_id of filialIds) {
      const f = await this.prisma.filial.findFirst({
        where: { id: filial_id, company_id: companyId, deleted_at: null },
      });
      if (!f) {
        throw new BadRequestException(
          ErrorMessages.notFound.modelNotFound('Filial'),
        );
      }
    }
  }

  private async assertDepartmentIds(
    companyId: number,
    departmentIds: number[],
  ): Promise<void> {
    for (const department_id of departmentIds) {
      const d = await this.prisma.department.findFirst({
        where: {
          id: department_id,
          company_id: companyId,
          deleted_at: null,
        },
      });
      if (!d) {
        throw new BadRequestException(
          ErrorMessages.notFound.modelNotFound('Department'),
        );
      }
    }
  }
}
