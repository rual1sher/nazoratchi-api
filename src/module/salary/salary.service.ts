import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { ISalaryQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class SalaryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSalaryDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const worker = await this.prisma.worker.findFirst({
      where: { id: dto.worker_id, company_id: cId, deleted_at: null },
      select: { id: true },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    return await this.prisma.salary.create({
      data: {
        company_id: cId,
        amount: dto.amount,
        type: dto.type,
        date_time: new Date(dto.date_time),
        status: dto.status ?? true,
        worker_id: dto.worker_id,
      },
    });
  }

  async findAll(query: ISalaryQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.salaryWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query?.workerId) {
      where.worker_id = +query.workerId;
    }

    const count = await this.prisma.salary.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const salary = await this.prisma.salary.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { worker: true },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { salary, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const salary = await this.prisma.salary.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: { worker: true },
    });

    if (!salary) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Salary'),
      );
    }
    return salary;
  }

  async update(id: number, dto: UpdateSalaryDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    if (dto.worker_id != null) {
      const worker = await this.prisma.worker.findFirst({
        where: { id: dto.worker_id, company_id: cId, deleted_at: null },
      });
      if (!worker) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Worker'),
        );
      }
    }

    return await this.prisma.salary.update({
      where: { id },
      data: {
        amount: dto.amount,
        type: dto.type,
        date_time: dto.date_time ? new Date(dto.date_time) : undefined,
        status: dto.status,
        worker_id: dto.worker_id,
      },
    });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    return await this.prisma.salary.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
