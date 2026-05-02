import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFilialDto } from './dto/create-filial.dto';
import { UpdateFilialDto } from './dto/update-filial.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IFilialQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { ErrorMessages } from 'src/helpers/error/error.message';

@Injectable()
export class FilialService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFilialDto) {
    return this.prisma.filial.create({
      data: {
        title_uz: dto.title_uz,
        title_ru: dto.title_ru,
        title_en: dto.title_en,
        company_id: dto.company_id,
        coordinate: dto.coordinate.trim(),
      },
    });
  }

  async findAll(query: IFilialQuery) {
    const where: Prisma.filialWhereInput = { deleted_at: null };

    if (query?.companyId) where.company_id = +query.companyId;

    if (query.search) {
      where.OR = [
        { title_uz: { contains: query.search, mode: 'insensitive' } },
        { title_ru: { contains: query.search, mode: 'insensitive' } },
        { title_en: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.filial.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const filial = await this.prisma.filial.findUnique({
      where: { id, deleted_at: null },
    });
    if (!filial) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }
    return filial;
  }

  async update(id: number, updateFilialDto: UpdateFilialDto) {
    const filial = await this.prisma.filial.findUnique({
      where: { id, deleted_at: null },
    });
    if (!filial) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }

    let data: Prisma.filialUncheckedUpdateInput = {};

    data = updateFilialDto;
    if (updateFilialDto.coordinate !== undefined) {
      data.coordinate = updateFilialDto.coordinate.trim();
    }

    return this.prisma.filial.update({ where: { id }, data });
  }

  async remove(id: number) {
    const filial = await this.prisma.filial.findUnique({
      where: { id, deleted_at: null },
    });
    if (!filial) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }

    return this.prisma.filial.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
