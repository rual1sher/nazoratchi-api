import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { hashingPassword } from 'src/helpers/hash/password';
import { IPayload, IUserQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: createUserDto.phone },
    });
    if (user) throw new ConflictException('User already exists');

    const data = { ...createUserDto };

    const hashedPassword = hashingPassword(data.password);
    data.password = hashedPassword;

    return this.prisma.user.create({
      data,
      omit: { token: true, password: true, role: true },
    });
  }

  async findAll(query: IUserQuery) {
    const where: Prisma.userWhereInput = { deleted_at: null };

    if (query?.companyId) {
      const companyId = Number(query.companyId);
      if (!companyId) throw new NotFoundException('Invalid company id');
      where.worker = { some: { company_id: companyId } };
    }

    const count = await this.prisma.user.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const users = await this.prisma.user.findMany({
      where,
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { created_at: 'desc' },
      include: { worker: true },
      omit: { password: true, token: true, role: true },
    });

    return { users, pagination };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
      include: { worker: true },
      omit: { token: true, password: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });
    if (!user) throw new NotFoundException('User not found');

    return await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
      omit: { password: true, token: true, role: true },
    });
  }
}
