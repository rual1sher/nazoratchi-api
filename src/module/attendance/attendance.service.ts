import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto, ManualAttendanceType } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { IAttendanceQuery } from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { attendance_type } from 'prisma/generated/prisma/enums';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

const toPrismaDateOnly = (iso: string): Date => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

const toPrismaTime = (iso: string): Date => {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) {
    throw new BadRequestException('Invalid time');
  }
  return new Date(
    Date.UTC(
      1970,
      0,
      1,
      t.getUTCHours(),
      t.getUTCMinutes(),
      t.getUTCSeconds(),
      t.getUTCMilliseconds(),
    ),
  );
};

const mapManualType = (type: ManualAttendanceType): attendance_type =>
  type === 'check-in' ? attendance_type.check_in : attendance_type.check_out;

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.assertWorkerAndBranch(cId, dto.employeeId, dto.branchId);

    const date = toPrismaDateOnly(dto.date);
    const time = toPrismaTime(dto.time);

    try {
      return await this.prisma.attendance.create({
        data: {
          company_id: cId,
          date,
          time,
          type: mapManualType(dto.type),
          description: dto.description ?? null,
          worker_id: dto.employeeId,
          branch_id: dto.branchId,
        },
        include: { worker: true, branch: true },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Attendance for this worker on this date already exists',
        );
      }
      throw e;
    }
  }

  async findAll(query: IAttendanceQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.attendanceWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    if (query?.workerId) where.worker_id = +query.workerId;

    const count = await this.prisma.attendance.count({ where });
    const pagination = new Pagination(count, query.page, query.limit);

    const attendance = await this.prisma.attendance.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { worker: true, branch: true },
      take: pagination.limit,
      skip: pagination.offset,
    });

    return { attendance, pagination };
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, deleted_at: null, company_id: cId },
      include: { worker: true, branch: true },
    });

    if (!attendance) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }
    return attendance;
  }

  async update(id: number, dto: UpdateAttendanceDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const existing = await this.prisma.attendance.findFirst({
      where: { id, deleted_at: null, company_id: cId },
    });

    if (!existing) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }

    if (dto.employeeId != null || dto.branchId != null) {
      await this.assertWorkerAndBranch(
        cId,
        dto.employeeId ?? existing.worker_id,
        dto.branchId ?? existing.branch_id,
      );
    }

    const data: Prisma.attendanceUncheckedUpdateInput = {};

    if (dto.date !== undefined) data.date = toPrismaDateOnly(dto.date);
    if (dto.time !== undefined) data.time = toPrismaTime(dto.time);
    if (dto.type !== undefined) data.type = mapManualType(dto.type);
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.employeeId !== undefined) data.worker_id = dto.employeeId;
    if (dto.branchId !== undefined) data.branch_id = dto.branchId;

    try {
      return await this.prisma.attendance.update({
        where: { id },
        data,
        include: { worker: true, branch: true },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'Attendance for this worker on this date already exists',
        );
      }
      throw e;
    }
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const attendance = await this.prisma.attendance.findFirst({
      where: { id, deleted_at: null, company_id: cId },
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

  private async assertWorkerAndBranch(
    companyId: number,
    workerId: number,
    branchId: number,
  ): Promise<void> {
    const [worker, branch] = await Promise.all([
      this.prisma.worker.findFirst({
        where: { id: workerId, company_id: companyId, deleted_at: null },
        select: { id: true },
      }),
      this.prisma.filial.findFirst({
        where: { id: branchId, company_id: companyId, deleted_at: null },
        select: { id: true },
      }),
    ]);

    if (!worker) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Worker'),
      );
    }
    if (!branch) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }
  }
}
