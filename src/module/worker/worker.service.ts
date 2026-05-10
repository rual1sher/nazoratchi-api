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
import { IWorkerQuery } from 'src/helpers/types/types';
import { Prisma, user_role } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import {
  validateRelations,
  validateRelationsQuery,
} from 'src/helpers/validate/validate-relations';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(
    createWorkerDto: CreateWorkerDto,
    role: user_role,
    companyId: number | null,
  ) {
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

    if (role !== user_role.admin) {
      data = { ...data, company_id: requireCompanyId(companyId) };
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
        schedule: true,
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { worker, pagination };
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

    await validateRelations(this.prisma, dto);

    if (dto.company_id != null && dto.company_id !== cId) {
      throw new ForbiddenException(
        ErrorMessages.forbidden.accessDenied,
      );
    }

    return await this.prisma.worker.update({
      where: { id },
      data: dto,
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
