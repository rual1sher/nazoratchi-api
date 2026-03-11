import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDayDto } from './dto/create-day.dto';
import { UpdateDayDto } from './dto/update-day.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IDayQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { validateRelations } from 'src/helpers/validate/validate-relations';

@Injectable()
export class DayService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDayDto, workerId: number) {
    if (workerId) {
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
    } else if (!workerId && dto.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id },
      });
      if (!company) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Company'),
        );
      }
    } else {
      throw new BadRequestException(
        ErrorMessages.badRequest.cannotCreateJobWithCompanyId,
      );
    }

    return await this.prisma.day.create({ data: dto });
  }

  async findAll(query: IDayQuery, workerId: number) {
    const where: Prisma.dayWhereInput = { deleted_at: null };

    if (workerId) where.company = { worker: { some: { id: workerId } } };
    if (!workerId && query?.companyId) where.company_id = +query.companyId;

    if (query.search) {
      where.OR = [
        { title_uz: { contains: query.search, mode: 'insensitive' } },
        { title_ru: { contains: query.search, mode: 'insensitive' } },
        { title_en: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const count = await this.prisma.day.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const day = await this.prisma.day.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { day, pagination };
  }

  async findOne(id: number) {
    const day = await this.prisma.day.findUnique({
      where: { id, deleted_at: null },
    });
    if (!day) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Day'));
    }

    return day;
  }

  async update(id: number, dto: UpdateDayDto, workerId: number) {
    const where: Prisma.dayWhereUniqueInput = { id, deleted_at: null };
    if (workerId) where.company = { worker: { some: { id: workerId } } };

    const day = await this.prisma.day.findUnique({ where });
    if (!day) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Day'));
    }

    if (dto?.company_id && workerId) {
      throw new ForbiddenException(ErrorMessages.forbidden.accessSufficient);
    }
    if (dto?.company_id) await validateRelations(this.prisma, dto);

    return await this.prisma.day.update({ where: { id }, data: dto });
  }

  async remove(id: number, workerId: number) {
    const where: Prisma.dayWhereInput = { id, deleted_at: null };
    if (workerId) where.company = { worker: { some: { id: workerId } } };

    const day = await this.prisma.day.findFirst({ where });
    if (!day) {
      throw new NotFoundException(ErrorMessages.notFound.modelNotFound('Day'));
    }

    return await this.prisma.day.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
