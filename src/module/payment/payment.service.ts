import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { validateRelations } from 'src/helpers/validate/validate-relations';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IPaymentQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { QueryWhere } from 'src/helpers/validate/validate-queryinwhere';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await validateRelations(this.prisma, dto);

    const worker = await this.prisma.worker.findFirst({
      where: { id: dto.worker_id, company_id: cId, deleted_at: null },
      select: { id: true },
    });
    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }

    return await this.prisma.payment.create({
      data: {
        company_id: cId,
        amount: dto.amount,
        type: dto.type,
        date: dto.date,
        comment: dto.comment ?? null,
        worker_id: dto.worker_id,
      },
    });
  }

  async findAll(query: IPaymentQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.paymentWhereInput = {
      deleted_at: null,
      company_id: cId,
    };
    QueryWhere(query, where);
    where.company_id = cId;

    const count = await this.prisma.payment.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const payment = await this.prisma.payment.findMany({
      where,
      include: {
        worker: {
          include: {
            user: {
              omit: { password: true, token: true, role: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { payment, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const payment = await this.prisma.payment.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: { worker: true },
    });
    if (!payment) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Payment'),
      );
    }

    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto, companyId: number | null) {
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

    await validateRelations(this.prisma, { ...dto, payment_id: id });
    return await this.prisma.payment.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.findOne(id, cId);

    return await this.prisma.payment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
