import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IPenaltyQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { penalty_type } from 'prisma/generated/prisma/enums';

@Injectable()
export class PenaltyService {
  constructor(private prisma: PrismaService) {}

  private ensureCompanyId(companyId: number) {
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }
  }

  private normalizePenaltyType(type: string): penalty_type {
    const normalized = type.trim().toLowerCase();
    const typeMap: Record<string, penalty_type> = {
      late: penalty_type.late_arrival,
      late_arrival: penalty_type.late_arrival,
      early: penalty_type.early_leave,
      early_leave: penalty_type.early_leave,
      no_exit: penalty_type.no_exit,
      absent: penalty_type.not_arrive,
      not_arrive: penalty_type.not_arrive,
    };

    const mappedType = typeMap[normalized];
    if (!mappedType) {
      throw new BadRequestException(
        `Unsupported penalty type: ${type}. Allowed: late, early, no_exit, absent`,
      );
    }

    return mappedType;
  }

  private parseMinutes(time: string): number {
    const matched = /^(\d+)m$/.exec(time.trim().toLowerCase());
    if (!matched) {
      throw new BadRequestException(
        `Invalid time format: ${time}. Expected Xm, for example 15m`,
      );
    }
    return Number(matched[1]);
  }

  private mapPenaltyTypeForClient(type: penalty_type): string {
    const typeMap: Record<penalty_type, string> = {
      late_arrival: 'late',
      early_leave: 'early',
      no_exit: 'no_exit',
      not_arrive: 'absent',
    };
    return typeMap[type];
  }

  private mapPenaltyGroupForClient(row: {
    id: number;
    title: string;
    penalty: {
      id: number;
      type: penalty_type;
      min_minutes: number;
      amount: number;
      comment: string | null;
    }[];
  }) {
    return {
      id: row.id,
      name: row.title,
      penalties: row.penalty.map((item) => ({
        id: item.id,
        type: this.mapPenaltyTypeForClient(item.type),
        time: `${item.min_minutes}m`,
        amount: item.amount,
        comment: item.comment,
      })),
    };
  }

  async create(dto: CreatePenaltyDto, companyId: number) {
    this.ensureCompanyId(companyId);

    if (!dto.penalties?.length) {
      throw new BadRequestException('penalties must contain at least one item');
    }

    return await this.prisma.$transaction(async (tx) => {
      const penaltyName = await tx.penalties_name.create({
        data: {
          title: dto.name,
          company_id: companyId,
        },
      });

      await tx.penalty.createMany({
        data: dto.penalties.map((item) => ({
          company_id: companyId,
          type: this.normalizePenaltyType(item.type),
          min_minutes: this.parseMinutes(item.time),
          amount: item.amount,
          comment: item.comment,
          penalties_name_id: penaltyName.id,
        })),
      });

      const created = await tx.penalties_name.findUnique({
        where: { id: penaltyName.id },
        include: {
          penalty: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
        },
      });

      return this.mapPenaltyGroupForClient(created!);
    });
  }

  async findAll(query: IPenaltyQuery, companyId: number) {
    this.ensureCompanyId(companyId);

    const where: Prisma.penalties_nameWhereInput = {
      deleted_at: null,
      company_id: companyId,
    };
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    const penaltyTypeFilter = query.type
      ? this.normalizePenaltyType(query.type as unknown as string)
      : undefined;

    const count = await this.prisma.penalties_name.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const penaltiesName = await this.prisma.penalties_name.findMany({
      where,
      include: {
        penalty: {
          where: {
            deleted_at: null,
            type: penaltyTypeFilter,
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: pagination.offset,
      take: pagination.limit,
    });

    return {
      penalty: penaltiesName.map((item) => this.mapPenaltyGroupForClient(item)),
      pagination,
    };
  }

  async findOne(id: number, companyId: number) {
    this.ensureCompanyId(companyId);

    const penalty = await this.prisma.penalties_name.findFirst({
      where: { id, deleted_at: null, company_id: companyId },
      include: {
        penalty: {
          where: { deleted_at: null },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!penalty) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Penalty'));
    }

    return this.mapPenaltyGroupForClient(penalty);
  }

  async update(id: number, dto: UpdatePenaltyDto, companyId: number) {
    this.ensureCompanyId(companyId);

    const existing = await this.prisma.penalties_name.findFirst({
      where: { id, deleted_at: null, company_id: companyId },
    });

    if (!existing) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Penalty'));
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.penalties_name.update({
        where: { id },
        data: {
          title: dto.name ?? undefined,
        },
      });

      if (dto.penalties) {
        await tx.penalty.updateMany({
          where: { penalties_name_id: id, deleted_at: null },
          data: { deleted_at: new Date() },
        });

        if (dto.penalties.length) {
          await tx.penalty.createMany({
            data: dto.penalties.map((item) => ({
              company_id: companyId,
              type: this.normalizePenaltyType(item.type),
              min_minutes: this.parseMinutes(item.time),
              amount: item.amount,
              comment: item.comment,
              penalties_name_id: id,
            })),
          });
        }
      }

      const updated = await tx.penalties_name.findUnique({
        where: { id },
        include: {
          penalty: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
        },
      });

      return this.mapPenaltyGroupForClient(updated!);
    });
  }

  async remove(id: number, companyId: number) {
    this.ensureCompanyId(companyId);

    const existing = await this.prisma.penalties_name.findFirst({
      where: { id, deleted_at: null, company_id: companyId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Penalty'));
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.penalty.updateMany({
        where: { penalties_name_id: id, deleted_at: null },
        data: { deleted_at: new Date() },
      });

      return tx.penalties_name.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
    });
  }
}
