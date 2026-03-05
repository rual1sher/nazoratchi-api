import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IDepartmentQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma, user_role } from 'prisma/generated/prisma/client';
import { ErrorMessages } from 'src/helpers/error/error.message';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, workerId: number, role: user_role) {
    if (role === 'worker') {
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
        select: { company_id: true },
      });
      if (!worker?.company_id) {
        throw new NotFoundException(
          ErrorMessages.notFound.workerInCompanyNotFound,
        );
      }

      dto.company_id = worker.company_id;
    } else if (role === 'admin' && dto.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id },
      });
      if (!company)
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Company'),
        );
    } else {
      throw new BadRequestException(
        ErrorMessages.badRequest.cannotCreateJobWithCompanyId,
      );
    }

    return await this.prisma.department.create({ data: dto });
  }

  async findAll(query: IDepartmentQuery, workerId: number, role: user_role) {
    const where: Prisma.departmentWhereInput = { deleted_at: null };

    if (workerId) where.company = { worker: { some: { id: workerId } } };
    if (role === 'admin' && query?.companyId) {
      where.company_id = +query.companyId;
    }

    const count = await this.prisma.department.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const department = await this.prisma.department.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { department, pagination };
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id, deleted_at: null },
    });
    if (!department) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Department'),
      );
    }

    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto, workerId: number) {
    const where: Prisma.departmentWhereInput = { id, deleted_at: null };
    if (workerId) where.company = { worker: { some: { id: workerId } } };

    const department = await this.prisma.department.findFirst({ where });
    if (!department) throw new NotFoundException('Department not found');

    if (dto?.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id },
      });
      if (!company) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Company'),
        );
      }
    }

    return await this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(id: number, workerId: number) {
    const where: Prisma.departmentWhereInput = { id, deleted_at: null };
    if (workerId) where.company = { worker: { some: { id: workerId } } };

    const department = await this.prisma.department.findFirst({ where });
    if (!department) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Department'),
      );
    }

    return await this.prisma.department.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
