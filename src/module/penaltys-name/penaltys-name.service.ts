import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CreatePenaltysNameDto } from './dto/create-penaltys-name.dto';
import { UpdatePenaltysNameDto } from './dto/update-penaltys-name.dto';
import { validateRelations } from 'src/helpers/validate/validate-relations';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IPenaltysNameQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { unescape } from 'querystring';

@Injectable()
export class PenaltysNameService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePenaltysNameDto, workerId: number) {
    if (workerId) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
        select: { company_id: true },
      });
      if (!worker) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Worker'),
        );
      }

      dto.company_id = worker.company_id;
    } else if (!workerId && dto.company_id) {
      await validateRelations(this.prisma, dto);
      dto.company_id = dto.company_id;
    } else {
      throw new BadRequestException(
        ErrorMessages.badRequest.cannotCreateJobWithCompanyId,
      );
    }

    return await this.prisma.penalties_name.create({ data: dto });
  }

  async findAll(query: IPenaltysNameQuery, workerId: number) {
    const where: Prisma.penalties_nameWhereInput = { deleted_at: null };

    if (workerId) where.company = { worker: { some: { id: workerId } } };
    if (!workerId && query.companyId) where.company_id = +query.companyId;

    if (query.search) {
      where.OR = [
        { title_uz: { contains: query.search, mode: 'insensitive' } },
        { title_ru: { contains: query.search, mode: 'insensitive' } },
        { title_en: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const count = await this.prisma.penalties_name.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const penaltysName = await this.prisma.penalties_name.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { penaltysName, pagination };
  }

  async findOne(id: number) {
    const penaltysName = await this.prisma.penalties_name.findUnique({
      where: { id, deleted_at: null },
    });
    if (!penaltysName) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Penalty'),
      );
    }

    return penaltysName;
  }

  async update(id: number, dto: UpdatePenaltysNameDto, workerId: number) {
    await validateRelations(this.prisma, { ...dto, penaltys_name_id: id });

    if (dto.company_id && workerId) {
      throw new ForbiddenException(ErrorMessages.forbidden.accessSufficient);
    }

    return await this.prisma.penalties_name.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await validateRelations(this.prisma, { penaltys_name_id: id });

    return await this.prisma.penalties_name.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
