import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { validateRelations } from 'src/helpers/validate/validate-relations';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    return await this.prisma.department.create({
      data: { ...dto, company_id: cId },
    });
  }

  async findAll(query: IQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.departmentWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query.search) {
      where.OR = [
        { title_uz: { contains: query.search, mode: 'insensitive' } },
        { title_ru: { contains: query.search, mode: 'insensitive' } },
        { title_en: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const count = await this.prisma.department.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const department = await this.prisma.department.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { position: true, worker: true } },
        position: { take: 5 },
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { department, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const department = await this.prisma.department.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: { position: true, worker: true },
    });
    if (!department) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Department'),
      );
    }

    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.departmentWhereInput = {
      id,
      deleted_at: null,
      company_id: cId,
    };

    const department = await this.prisma.department.findFirst({ where });
    if (!department) throw new NotFoundException('Department not found');

    return await this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const existing = await this.prisma.department.findFirst({
      where: { id, deleted_at: null, company_id: cId },
    });
    if (!existing) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Department'),
      );
    }

    await validateRelations(this.prisma, { department_id: id });

    return await this.prisma.department.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
