import { Injectable } from '@nestjs/common';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
import {
  validateRelations,
  validateRelationsQuery,
} from 'src/helpers/validate/validate-relations';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IPenaltyQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';

@Injectable()
export class PenaltyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePenaltyDto) {
    await validateRelations(this.prisma, dto);
    return await this.prisma.penalty.create({ data: dto });
  }

  async findAll(query: IPenaltyQuery) {
    const where: Prisma.penaltyWhereInput = { deleted_at: null };
    if (query.type) where.type = query.type;

    await validateRelationsQuery(this.prisma, query, where);

    const count = await this.prisma.penalty.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const penalty = await this.prisma.penalty.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: pagination.offset,
      take: pagination.limit,
    });

    return {
      penalty,
      pagination,
    };
  }

  async findOne(id: number) {
    const penalty = await this.prisma.penalty.findUnique({
      where: { id, deleted_at: null },
    });

    if (!penalty) {
      throw ErrorMessages.notFound.modelNotFound('Penalty');
    }

    return penalty;
  }

  async update(id: number, dto: UpdatePenaltyDto) {
    await validateRelations(this.prisma, { penalty_id: id, ...dto });

    return await this.prisma.penalty.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await validateRelations(this.prisma, { penalty_id: id });

    return await this.prisma.penalty.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
