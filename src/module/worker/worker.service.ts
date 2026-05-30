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
import { IWorkerQuery, IDashboardWorkerQuery } from 'src/helpers/types/types';
import { Prisma, user_role } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import {
  validateRelations,
  validateRelationsQuery,
} from 'src/helpers/validate/validate-relations';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkerDto: CreateWorkerDto, role: user_role) {
    let { user, user_id, ...data } = createWorkerDto;

    if (user) {
      const chechUser = await this.prisma.user.findUnique({
        where: { phone: user.phone },
      });
      if (chechUser) {
        throw new ConflictException(
          ErrorMessages.conflict.alreadyExists('User'),
        );
      }

      const hashedPassword = hashingPassword(user.password);
      user.password = hashedPassword;

      user_id = (
        await this.prisma.user.create({
          data: user,
        })
      ).id;
    } else if (user_id) {
      user_id = +user_id;
    } else {
      throw new BadRequestException(
        ErrorMessages.badRequest.userOrUserIdNotFound,
      );
    }

    const checkWorker = await this.prisma.worker.findFirst({
      where: { user_id, company_id: data.company_id, deleted_at: null },
    });
    if (checkWorker) {
      throw new ConflictException(
        ErrorMessages.conflict.alreadyExists(
          'Worker with this User and Company',
        ),
      );
    }

    await validateRelations(this.prisma, data);

    if (data?.role && role !== 'admin') {
      throw new ForbiddenException(ErrorMessages.forbidden.accessSufficient);
    }

    return await this.prisma.worker.create({
      data: { ...data, user_id },
    });
  }

  async findAll(query: IWorkerQuery, companyId: number) {
    const { search, ...wheresOptional } = query;
    const where: Prisma.workerWhereInput = {
      deleted_at: null,
      company_id: companyId,
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
        day: true,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { worker, pagination };
  }

  async getDashboardWorkers(query: IDashboardWorkerQuery, companyId: number) {
    const { department_id, filial_id, date } = query;
    const targetDate = new Date(isNaN(Number(date)) ? date : Number(date));
    const dayOfWeek = targetDate.getDay(); // 0 (Sun) to 6 (Sat)
    const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    const where: Prisma.workerWhereInput = {
      company_id: companyId,
      deleted_at: null,
    };

    if (department_id) where.department_id = +department_id;
    if (filial_id) where.filial_id = +filial_id;

    const workers = await this.prisma.worker.findMany({
      where,
      include: {
        day: {
          include: {
            worker_schedule: {
              where: {
                day: dbDayOfWeek,
                deleted_at: null,
              },
            },
          },
        },
        attendance: {
          where: {
            date: {
              equals: targetDate,
            },
            deleted_at: null,
          },
        },
      },
    });

    let on_time = 0;
    let late = 0;
    let not_work = 0;

    for (const worker of workers) {
      const schedule = worker.day?.worker_schedule?.[0];
      const attendance = worker.attendance?.[0];

      if (!schedule) {
        continue;
      }

      if (!attendance || !attendance.arrival_at) {
        not_work++;
      } else {
        const arrivalTime = new Date(attendance.arrival_at);
        const scheduleStartTime = new Date(schedule.start_time);

        const arrivalTotalMinutes =
          arrivalTime.getHours() * 60 + arrivalTime.getMinutes();
        const scheduleTotalMinutes =
          scheduleStartTime.getHours() * 60 + scheduleStartTime.getMinutes();

        if (arrivalTotalMinutes <= scheduleTotalMinutes) {
          on_time++;
        } else {
          late++;
        }
      }
    }

    return {
      all: on_time + late + not_work,
      on_time,
      late,
      not_work,
    };
  }

  async findOne(id: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, deleted_at: null },
      include: {
        user: { omit: { token: true, password: true, role: true } },
        department: true,
        position: true,
        company: true,
        day: true,
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

  async update(id: number, dto: UpdateWorkerDto) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, deleted_at: null },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    await validateRelations(this.prisma, dto);

    if (dto.company_id) {
      const checkWorker = await this.prisma.worker.findFirst({
        where: { id, company_id: dto.company_id, deleted_at: null },
      });
      if (checkWorker) {
        throw new BadRequestException(
          ErrorMessages.badRequest.invalid('Company'),
        );
      }
    }

    return await this.prisma.worker.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, deleted_at: null },
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
