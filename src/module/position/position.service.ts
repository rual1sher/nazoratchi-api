import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IPositionQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { validateRelations } from 'src/helpers/validate/validate-relations';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto) {
    await validateRelations(this.prisma, {department_id: dto.department_id})
    return await this.prisma.position.create({ data: dto });
  }

  async findAll(query: IPositionQuery) {
    const where: Prisma.positionWhereInput = { deleted_at: null };

    if (query?.departmentId) where.department_id = +query.departmentId;
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
      include: { _count: { select: { worker: true } }, worker: { take: 5 } },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { position, pagination };
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id, deleted_at: null },
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

  async update(id: number, dto: UpdatePositionDto) {
    const where: Prisma.positionWhereInput = { id, deleted_at: null };

    const position = await this.prisma.position.findFirst({ where });
    if (!position) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Position'),
      );
    }

    if (dto?.department_id) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.department_id, deleted_at: null },
      });

      if (!department) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Department'),
        );
      }
    }

    return await this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const where: Prisma.positionWhereInput = { id, deleted_at: null };

    const position = await this.prisma.position.findFirst({ where });
    if (!position) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Position'),
      );
    }

    return await this.prisma.position.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
