import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IAttendanceQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto) {
    return await this.prisma.attendance.create({
      data: {
        date: new Date(dto.date),
        worker_id: dto.worker_id,
        arrival_at: dto.arrival_at ? new Date(dto.arrival_at) : null,
        departure_at: dto.departure_at ? new Date(dto.departure_at) : null,
      },
    });
  }

  async findAll(query: IAttendanceQuery) {
    const where: Prisma.attendanceWhereInput = { deleted_at: null };

    if (query?.workerId) where.worker_id = +query.workerId;

    const count = await this.prisma.attendance.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const attendance = await this.prisma.attendance.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { worker: true },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { attendance, pagination };
  }

  async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id, deleted_at: null },
      include: { worker: true },
    });
    
    if (!attendance) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }
    return attendance;
  }

  async update(id: number, dto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id, deleted_at: null },
    });
    
    if (!attendance) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }

    return await this.prisma.attendance.update({
      where: { id },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        worker_id: dto.worker_id,
        arrival_at: dto.arrival_at ? new Date(dto.arrival_at) : undefined,
        departure_at: dto.departure_at ? new Date(dto.departure_at) : undefined,
      },
    });
  }

  async remove(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id, deleted_at: null },
    });
    
    if (!attendance) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }

    return await this.prisma.attendance.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
