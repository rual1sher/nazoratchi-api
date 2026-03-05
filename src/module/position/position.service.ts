import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { user_role } from 'prisma/generated/prisma/enums';
import { IPositionQuery } from 'src/helpers/types/types';
import { Prisma } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';
import { ErrorMessages } from 'src/helpers/error/error.message';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto, workerId: number, role: user_role) {
    if (role === 'worker') {
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
    } else if (role === 'admin' && dto.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id },
      });
      if (!company) throw new NotFoundException('Company not found');
    } else {
      throw new BadRequestException(
        ErrorMessages.badRequest.cannotCreateJobWithCompanyId,
      );
    }

    return await this.prisma.position.create({ data: dto });
  }

  async findAll(query: IPositionQuery, workerId: number, role: user_role) {
    const where: Prisma.positionWhereInput = { deleted_at: null };

    if (workerId) where.company = { worker: { some: { id: workerId } } };
    if (role === 'admin' && query?.companyId) {
      where.company_id = +query.companyId;
    }

    const count = await this.prisma.position.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const position = await this.prisma.position.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { position, pagination };
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id, deleted_at: null },
    });
    if (!position) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Position'),
      );
    }

    return position;
  }

  async update(
    id: number,
    dto: UpdatePositionDto,
    workerId: number,
    role: user_role,
  ) {
    const where: Prisma.positionWhereInput = { id, deleted_at: null };
    if (workerId) where.company = { worker: { some: { id: workerId } } };

    const position = await this.prisma.position.findFirst({ where });
    if (!position)
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Position'),
      );

    if (dto?.company_id && role !== 'admin') {
      throw new ForbiddenException(ErrorMessages.forbidden.accessSufficient);
    } else if (dto?.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id },
      });
      if (!company) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Company'),
        );
      }
    }

    return await this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: number, workerId: number) {
    const where: Prisma.positionWhereInput = { id, deleted_at: null };
    if (workerId) where.company = { worker: { some: { id: workerId } } };

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
