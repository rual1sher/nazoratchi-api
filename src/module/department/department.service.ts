import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { validateRelations } from 'src/helpers/validate/validate-relations';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, cId: number) {
    return await this.prisma.department.create({
      data: { ...dto, company_id: cId },
    });
  }

  async findAll(query: IQuery, companyId: number) {
    const where: Prisma.departmentWhereInput = {
      deleted_at: null,
      company_id: companyId,
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

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id, deleted_at: null },
      include: { position: true, worker: true },
    });
    if (!department) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Department'),
      );
    }

    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto, companyId: number) {
    const where: Prisma.departmentWhereInput = {
      id,
      deleted_at: null,
      company_id: companyId,
    };

    const department = await this.prisma.department.findFirst({ where });
    if (!department) throw new NotFoundException('Department not found');

    if (dto?.company_id) {
      await validateRelations(this.prisma, { company_id: dto.company_id });
    }

    return await this.prisma.department.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await validateRelations(this.prisma, { department_id: id });

    return await this.prisma.department.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
