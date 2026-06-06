import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { hashingPassword } from 'src/helpers/hash/password';
import {
  IWorkerQuery,
  IDashboardWorkerQuery,
  IQuery,
  IMyWorkerAttendanceQuery,
  IWorkerMonitoringQuery,
} from 'src/helpers/types/types';
import {
  payment_type,
  Prisma,
  user_role,
} from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import {
  validateRelations,
  validateRelationsQuery,
} from 'src/helpers/validate/validate-relations';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

const toPrismaDateOnly = (value: string): Date => {
  const d = new Date(isNaN(Number(value)) ? value : Number(value));
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

const timeToMinutes = (d: Date): number =>
  d.getUTCHours() * 60 + d.getUTCMinutes();

const parseIdFilter = (value?: string | string[]): number[] | undefined => {
  if (value == null || value === '') return undefined;
  const arr = Array.isArray(value) ? value : [value];
  if (arr.length === 0) return undefined;
  const ids = arr.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  return ids.length ? ids : undefined;
};

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(
    createWorkerDto: CreateWorkerDto,
    role: user_role,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);
    let {
      user,
      company_id: _omitCompany,
      ...data
    } = createWorkerDto as CreateWorkerDto & { company_id?: number };

    return await this.prisma.$transaction(async (tx) => {
      const userWhere: Prisma.userWhereInput[] = [{ phone: user.phone }];
      if (user.username) {
        userWhere.push({ username: user.username });
      }

      const chechUser = await tx.user.findFirst({
        where: { OR: userWhere },
      });
      if (chechUser) {
        throw new ConflictException(
          ErrorMessages.conflict.alreadyExists(
            'User with this phone or username',
          ),
        );
      }

      user.password = hashingPassword(user.password);

      const newUser = await tx.user.create({
        data: user,
        omit: { token: true, password: true, role: true },
      });

      const checkWorker = await tx.worker.findFirst({
        where: {
          user_id: newUser.id,
          company_id: cId,
          deleted_at: null,
        },
      });
      if (checkWorker) {
        throw new ConflictException(
          ErrorMessages.conflict.alreadyExists(
            'Worker with this User and Company',
          ),
        );
      }

      await validateRelations(tx as typeof this.prisma, data);

      if (data?.role && role !== 'admin') {
        throw new ForbiddenException(ErrorMessages.forbidden.accessSufficient);
      }

      return await tx.worker.create({
        data: { ...data, company_id: cId, user_id: newUser.id },
      });
    });
  }

  async findAll(query: IWorkerQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const { search, ...wheresOptional } = query;
    const where: Prisma.workerWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    await validateRelationsQuery(this.prisma, wheresOptional, where);

    if (search) {
      where.user = {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const count = await this.prisma.worker.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const worker = await this.prisma.worker.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        user: { omit: { token: true, password: true, role: true } },
        position: true,
        filial: true,
        department: true,
        company: true,
        schedule: true,
        tasks: true,
        salary: true,
        payment: true,
        attendance: true,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { worker, pagination };
  }

  async getWorkerAttendance(id: number, companyId: number, date: string) {
    const cId = requireCompanyId(companyId);
    const targetDate = toPrismaDateOnly(date ?? new Date().toISOString());

    const worker = await this.prisma.worker.findFirst({
      where: {
        id,
        company_id: cId,
        deleted_at: null,
        attendance: { some: { date: targetDate } },
      },
      include: {
        attendance: {
          where: {
            date: targetDate,
            deleted_at: null,
            company_id: cId,
          },
        },
      },
    });
    if (!worker?.attendance?.length) {
      return [];
    }

    return worker.attendance.map((attendance) => ({
      id: attendance.id,
      date: attendance.date,
      check_in_at: attendance.check_in_at,
      check_out_at: attendance.check_out_at,
      resource: attendance.resource,
      description: attendance.description,
    }));
  }

  async getMyPayments(
    type: payment_type[],
    companyId: number,
    workerId: number | null,
    query?: IQuery,
  ) {
    if (!workerId) throw new BadRequestException('Worker ID is required');

    const cId = requireCompanyId(companyId);
    const worker = await this.prisma.worker.findFirst({
      where: { id: workerId, company_id: cId, deleted_at: null },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    const count = await this.prisma.payment.count({
      where: {
        company_id: cId,
        deleted_at: null,
        worker_id: workerId,
        type: { in: type },
      },
    });
    const pagination = new Pagination(
      count,
      query?.page ?? 1,
      query?.limit ?? 10,
    );

    const payment = await this.prisma.payment.findMany({
      where: {
        company_id: cId,
        deleted_at: null,
        worker_id: workerId,
        type: { in: type },
      },
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { payment, pagination };
  }

  async monitoring(query: IWorkerMonitoringQuery, companyId?: number | null) {
    const cId = requireCompanyId(companyId);
    const targetDate = toPrismaDateOnly(query.date ?? new Date().toISOString());
    const weekday = targetDate.getUTCDay() === 0 ? 7 : targetDate.getUTCDay();

    const where: Prisma.workerWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query.branchId) {
      where.filial_id = Number(query.branchId);
    }
    if (query.departmentId) {
      where.department_id = Number(query.departmentId);
    }

    const workers = await this.prisma.worker.findMany({
      where,
      include: {
        user: { omit: { password: true, token: true, role: true } },
        position: true,
        filial: true,
        schedule: {
          where: { deleted_at: null },
          include: {
            days: {
              where: { day: weekday, deleted_at: null },
            },
          },
        },
        attendance: {
          where: {
            date: targetDate,
            deleted_at: null,
            company_id: cId,
          },
        },
      },
    });

    let items = workers.map((worker) => {
      const daySchedule = worker.schedule?.days?.[0];
      const attendance = worker.attendance[0];
      let type: 'on_time' | 'late' | 'not_work' = 'not_work';

      if (attendance?.check_in_at) {
        if (daySchedule) {
          const arrivalMinutes = timeToMinutes(attendance.check_in_at);
          const startMinutes = timeToMinutes(daySchedule.start_time);
          type = arrivalMinutes <= startMinutes ? 'on_time' : 'late';
        } else {
          type = 'on_time';
        }
      }

      return {
        id: worker.id,
        type,
        user: {
          avatar: worker.user.avatar,
          first_name: worker.user.first_name,
          last_name: worker.user.last_name,
          username: worker.user.username,
          position: worker.position
            ? {
                title_uz: worker.position.title_uz,
                title_ru: worker.position.title_ru,
                title_en: worker.position.title_en,
              }
            : null,
        },
        filial: worker.filial
          ? {
              id: worker.filial.id,
              name: worker.filial.name,
              address: worker.filial.address,
            }
          : null,
        schedule: worker.schedule
          ? {
              id: worker.schedule.id,
              name: worker.schedule.name,
              type: worker.schedule.type,
              days_frequency: worker.schedule.days_frequency,
            }
          : null,
      };
    });

    const count = items.length;
    const pagination = new Pagination(count, query.page, query.limit);
    const worker = items.slice(
      pagination.offset,
      pagination.offset + pagination.limit,
    );

    return { worker, pagination };
  }

  async getMyAttendance(
    query: IMyWorkerAttendanceQuery,
    companyId: number,
    workerId: number | null,
  ) {
    if (!workerId) throw new BadRequestException('Worker ID is required');

    const cId = requireCompanyId(companyId);

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        worker_id: workerId,
        company_id: cId,
        deleted_at: null,
        date: query.date
          ? toPrismaDateOnly(query.date)
          : toPrismaDateOnly(new Date().toISOString()),
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }

    return attendance;
  }

  async getDashboardWorkers(
    query: IDashboardWorkerQuery,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);

    const targetDate = toPrismaDateOnly(query.date ?? new Date().toISOString());
    const weekday = targetDate.getUTCDay() === 0 ? 7 : targetDate.getUTCDay();

    const where: Prisma.workerWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    const departmentIds = parseIdFilter(query.department_id);
    const filialIds = parseIdFilter(query.filial_id);
    if (departmentIds?.length) where.department_id = { in: departmentIds };
    if (filialIds?.length) where.filial_id = { in: filialIds };

    const workers = await this.prisma.worker.findMany({
      where,
      include: {
        schedule: {
          where: { deleted_at: null },
          include: {
            days: {
              where: { day: weekday, deleted_at: null },
            },
          },
        },
        attendance: {
          where: {
            date: targetDate,
            deleted_at: null,
            company_id: cId,
          },
        },
      },
    });

    let on_time = 0;
    let late = 0;
    let not_work = 0;

    for (const worker of workers) {
      const daySchedule = worker.schedule?.days?.[0];
      if (!daySchedule) continue;

      const attendance = worker.attendance[0];
      if (!attendance?.check_in_at) {
        not_work++;
        continue;
      }

      const arrivalMinutes = timeToMinutes(attendance.check_in_at);
      const startMinutes = timeToMinutes(daySchedule.start_time);

      if (arrivalMinutes <= startMinutes) {
        on_time++;
      } else {
        late++;
      }
    }

    return {
      all: on_time + late + not_work,
      on_time,
      late,
      not_work,
    };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const worker = await this.prisma.worker.findFirst({
      where: { id, company_id: cId, deleted_at: null },
      include: {
        user: { omit: { token: true, password: true, role: true } },
        department: true,
        position: true,
        company: true,
        schedule: true,
      },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    return worker;
  }

  async findOneByUserAndCompany(userId: number, companyId: number) {
    const worker = await this.prisma.worker.findFirst({
      where: { company_id: companyId, user_id: userId, deleted_at: null },
    });
    if (!worker) {
      throw new BadRequestException(
        ErrorMessages.badRequest.invalid('User or Company'),
      );
    }

    return worker;
  }

  async update(id: number, dto: UpdateWorkerDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const worker = await this.prisma.worker.findFirst({
      where: { id, company_id: cId, deleted_at: null },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    const { company_id: _omitCompany, ...dtoSafe } = dto as UpdateWorkerDto & {
      company_id?: number;
    };
    await validateRelations(this.prisma, dtoSafe);

    const { user, ...data } = dtoSafe;

    if (user) {
      const userWhere: Prisma.userWhereInput[] = [];
      if (user.phone) userWhere.push({ phone: user.phone });
      if (user.username) userWhere.push({ username: user.username });

      if (userWhere.length) {
        const duplicate = await this.prisma.user.findFirst({
          where: {
            id: { not: worker.user_id },
            deleted_at: null,
            OR: userWhere,
          },
        });
        if (duplicate) {
          throw new ConflictException(
            ErrorMessages.conflict.alreadyExists(
              'User with this phone or username',
            ),
          );
        }
      }

      const userData: Prisma.userUpdateInput = {
        avatar: user.avatar,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        username: user.username,
      };

      if (user.password) delete userData.password;

      await this.prisma.user.update({
        where: { id: worker.user_id },
        data: userData,
      });
    }

    return await this.prisma.worker.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const worker = await this.prisma.worker.findFirst({
      where: { id, company_id: cId, deleted_at: null },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    return await this.prisma.worker.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
