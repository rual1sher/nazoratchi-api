import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IPositionQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const dep = await this.prisma.department.findFirst({
      where: { id: dto.department_id, company_id: cId, deleted_at: null },
    });
    if (!dep) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Department'),
      );
    }

    return await this.prisma.position.create({ data: dto });
  }

  async findAll(query: IPositionQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const where: Prisma.positionWhereInput = {
      deleted_at: null,
      department: { is: { company_id: cId, deleted_at: null } },
    };

    if (query?.departmentId) {
      where.department_id = +query.departmentId;
    }

    if (query.search) {
      where.OR = [
        { title_uz: { contains: query.search, mode: 'insensitive' } },
        { title_ru: { contains: query.search, mode: 'insensitive' } },
        { title_en: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const count = await this.prisma.position.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const position = await this.prisma.position.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        department: true,
        _count: { select: { worker: true } },
      },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { position, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const position = await this.prisma.position.findFirst({
      where: {
        id,
        deleted_at: null,
        department: { company_id: cId, deleted_at: null },
      },
      include: {
        worker: {
          include: {
            user: { omit: { token: true, password: true, role: true } },
          },
        },
      },
    });
    if (!position) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Position'),
      );
    }

    return position;
  }

  async update(id: number, dto: UpdatePositionDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    if (dto?.department_id != null) {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.department_id, company_id: cId, deleted_at: null },
      });

      if (!department) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Department'),
        );
      }
    }

    return await this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    return await this.prisma.position.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
