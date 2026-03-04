import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { hashingPassword } from 'src/helpers/hash/password';
import { IWorkerQuery } from 'src/helpers/types/types';
import { Prisma, user_role } from 'prisma/generated/prisma/client';
import { Pagination } from 'src/helpers/pagination/pagination';

@Injectable()
export class WorkerService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkerDto: CreateWorkerDto, role: user_role) {
    let user_id: number | null = null;

    if (createWorkerDto?.user) {
      const chechUser = await this.prisma.user.findUnique({
        where: { phone: createWorkerDto.user.phone },
      });
      if (chechUser) throw new ConflictException('User already exists');

      const hashedPassword = hashingPassword(createWorkerDto.user.password);
      createWorkerDto.user.password = hashedPassword;

      user_id = (
        await this.prisma.user.create({
          data: createWorkerDto.user,
        })
      ).id;
    } else if (createWorkerDto?.user_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: createWorkerDto.user_id, deleted_at: null },
      });

      if (!user) throw new NotFoundException('User not found');

      user_id = user.id;
    } else {
      throw new BadRequestException('User or user_id not found');
    }

    if (createWorkerDto?.role && role !== 'admin') {
      throw new BadRequestException(
        'To create a workspace with the role of admin access',
      );
    }

    return await this.prisma.worker.create({
      data: {
        user_id,
        company_id: createWorkerDto.company_id,
        role: createWorkerDto.role || 'worker',
      },
    });
  }

  async findAll(query: IWorkerQuery) {
    const where: Prisma.workerWhereInput = { deleted_at: null };

    if (query?.companyId) where.company_id = +query.companyId;
    if (query?.userId) where.user_id = +query.userId;

    const count = await this.prisma.worker.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const worker = await this.prisma.worker.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { worker, pagination };
  }

  async findOne(id: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, deleted_at: null },
      include: { user: { omit: { token: true, password: true, role: true } } },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return worker;
  }

  async findOneByUserAndWorker(userId: number, workerId: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId, user_id: userId, deleted_at: null },
    });

    if (!worker) {
      throw new BadRequestException(
        'The connection between the worker and the user is not established',
      );
    }

    return worker;
  }

  async update(id: number, dto: UpdateWorkerDto) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, deleted_at: null },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    try {
      return await this.prisma.worker.update({
        where: { id },
        data: dto,
      });
    } catch (e) {
      if (e.code === 'P2003') throw new BadRequestException('realtion involid');
      throw new Error(e);
    }
  }

  async remove(id: number) {
    const worker = await this.prisma.worker.findUnique({
      where: { id, deleted_at: null },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    return await this.prisma.worker.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
