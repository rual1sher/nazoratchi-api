import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFilialDto } from './dto/create-filial.dto';
import { UpdateFilialDto } from './dto/update-filial.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { IFilialQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { Pagination } from 'src/helpers/pagination/pagination';
import { FILIAL_COORDINATES_LAT_LNG } from './dto/create-filial.dto';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

export type FilialListItem = {
  id: number;
  name: string;
  address: string;
  radius: number;
  status: 'active' | 'inactive';
  coordinates: [number, number];
  _count: { worker: number };
};

type FilialWithWorkerCount = Prisma.filialGetPayload<{
  include: { _count: { select: { worker: true } } };
}>;

@Injectable()
export class FilialService {
  constructor(private prisma: PrismaService) {}

  private normalizeCoordinatesString(raw: string): string {
    return raw
      .split(',')
      .map((p) => p.trim())
      .join(',');
  }

  private coordinatesToTuple(raw: string): [number, number] {
    const s = raw.trim();
    if (!FILIAL_COORDINATES_LAT_LNG.test(s)) {
      throw new BadRequestException(
        'coordinates must be "lat,lng" (e.g. 41.55,60.63)',
      );
    }
    const [a, b] = s.split(',').map((x) => Number.parseFloat(x.trim()));
    return [a, b];
  }

  private serializeFilial(row: FilialWithWorkerCount): FilialListItem {
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      radius: row.radius,
      status: row.deleted_at ? 'inactive' : 'active',
      coordinates: this.coordinatesToTuple(row.coordinates),
      _count: { worker: row._count.worker },
    };
  }

  async create(dto: CreateFilialDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const created = await this.prisma.filial.create({
      data: {
        name: dto.name.trim(),
        address: dto.address.trim(),
        radius: dto.radius,
        coordinates: this.normalizeCoordinatesString(dto.coordinates),
        company_id: cId,
      },
      include: { _count: { select: { worker: true } } },
    });

    return this.serializeFilial(created);
  }

  async findAll(query: IFilialQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const where: Prisma.filialWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const count = await this.prisma.filial.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const rows = await this.prisma.filial.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { worker: true } } },
      take: pagination.limit,
      skip: pagination.offset,
    });

    const filial = rows.map((r) => this.serializeFilial(r));
    return { filial, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const row = await this.prisma.filial.findFirst({
      where: { id, company_id: cId, deleted_at: null },
      include: { _count: { select: { worker: true } } },
    });

    if (!row) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }

    return this.serializeFilial(row);
  }

  async update(
    id: number,
    dto: UpdateFilialDto,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);

    const existing = await this.prisma.filial.findFirst({
      where: { id, company_id: cId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }

    const data: Prisma.filialUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.address !== undefined) data.address = dto.address.trim();
    if (dto.radius !== undefined) data.radius = dto.radius;
    if (dto.coordinates !== undefined) {
      data.coordinates = this.normalizeCoordinatesString(dto.coordinates);
    }

    if (Object.keys(data).length === 0) {
      const row = await this.prisma.filial.findFirst({
        where: { id, company_id: cId },
        include: { _count: { select: { worker: true } } },
      });
      if (!row) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Filial'),
        );
      }
      return this.serializeFilial(row);
    }

    const updated = await this.prisma.filial.update({
      where: { id },
      data,
      include: { _count: { select: { worker: true } } },
    });

    return this.serializeFilial(updated);
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const existing = await this.prisma.filial.findFirst({
      where: { id, company_id: cId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }

    const updated = await this.prisma.filial.update({
      where: { id },
      data: { deleted_at: new Date() },
      include: { _count: { select: { worker: true } } },
    });

    return this.serializeFilial(updated);
  }
}
