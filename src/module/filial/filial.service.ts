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
    const { coordinates, ...data } = dto;

    const filial = await this.prisma.filial.create({ data });

    await Promise.all(
      coordinates.map(
        async (coordinate) =>
          await this.prisma.coordinate.create({
            data: { coordinate, filial_id: filial.id },
          }),
      ),
    );

    return filial;
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

    const filials = await this.prisma.filial.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return filials;
  }

  async findOne(id: number) {
    const filial = await this.prisma.filial.findUnique({
      where: { id, deleted_at: null },
      include: { coordinate: true },
    });
    if (!filial) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }

    const { coordinate, ...data } = filial;

    return { ...data, coordinate: coordinate.map((el) => el.coordinate) };
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

    const { coordinates, ...data } = updateFilialDto;

    if (coordinates) {
      await this.prisma.coordinate.deleteMany({
        where: { filial_id: id },
      });

      await Promise.all(
        coordinates.map(
          async (coordinate) =>
            await this.prisma.coordinate.create({
              data: { coordinate, filial_id: id },
            }),
        ),
      );
    }

    return await this.prisma.filial.update({ where: { id }, data });
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

    return await this.prisma.filial.update({
      where: { id },
      data: { deleted_at: null },
    });
  }
}
