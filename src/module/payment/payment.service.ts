import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  validateRelations,
  validateRelationsQuery,
} from 'src/helpers/validate/validate-relations';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IPaymentQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { QueryWhere } from 'src/helpers/validate/validate-queryinwhere';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    await validateRelations(this.prisma, dto);
    return await this.prisma.payment.create({ data: dto });
  }

  async findAll(query: IPaymentQuery) {
    const where: Prisma.paymentWhereInput = { deleted_at: null };
    QueryWhere(query, where);

    const count = await this.prisma.payment.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const payment = await this.prisma.payment.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { payment, pagination };
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id, deleted_at: null },
      include: { worker: true },
    });
    if (!payment) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Payment'),
      );
    }

    return payment;
  }

  async update(id: number, dto: UpdatePaymentDto) {
    await validateRelations(this.prisma, { ...dto, payment_id: id });
    return await this.prisma.payment.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await validateRelations(this.prisma, { payment_id: id });

    return await this.prisma.payment.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
