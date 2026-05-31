import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import {
  IAttendanceDashboardQuery,
  IAttendanceQuery,
  IAttendanceReportQuery,
  IAttendanceChartQuery,
} from 'src/helpers/types/types';
import { Pagination } from 'src/helpers/pagination/pagination';
import { Prisma } from 'prisma/generated/prisma/client';
import { attendance_resource } from 'prisma/generated/prisma/enums';
import { requireCompanyId } from 'src/helpers/company/require-company-id';
import * as ExcelJS from 'exceljs';

export type AttendanceChartRow = {
  id: number;
  date: string;
  on_time: number;
  late: number;
  not_work: number;
};

const toPrismaDateOnly = (iso: string): Date => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

const toTimestamp = (iso: string): Date => {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) {
    throw new BadRequestException('Invalid time');
  }
  return t;
};

const combineDateAndTime = (dateIso: string, timeIso: string): Date => {
  const dateOnly = toPrismaDateOnly(dateIso);
  const time = toTimestamp(timeIso);
  return new Date(
    Date.UTC(
      dateOnly.getUTCFullYear(),
      dateOnly.getUTCMonth(),
      dateOnly.getUTCDate(),
      time.getUTCHours(),
      time.getUTCMinutes(),
      time.getUTCSeconds(),
      time.getUTCMilliseconds(),
    ),
  );
};

const formatTotalHours = (checkIn: Date, checkOut: Date): string | null => {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  if (diffMs <= 0) return null;
  const hours = diffMs / (1000 * 60 * 60);
  return hours.toFixed(2);
};

const timeToMinutes = (d: Date): number =>
  d.getUTCHours() * 60 + d.getUTCMinutes();

const CHART_DAYS = 30;

const getLast30Days = (): Date[] => {
  const dates: Date[] = [];
  const today = toPrismaDateOnly(new Date().toISOString());
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(toPrismaDateOnly(d.toISOString()));
  }
  return dates;
};

const getDaysInRange = (from: Date, to: Date): Date[] => {
  if (from.getTime() > to.getTime()) {
    throw new BadRequestException(
      'date_from must be before or equal to date_to',
    );
  }
  const dates: Date[] = [];
  const cur = new Date(from);
  while (cur.getTime() <= to.getTime()) {
    dates.push(toPrismaDateOnly(cur.toISOString()));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
};

const getChartDates = (query: IAttendanceChartQuery): Date[] => {
  const hasFrom = Boolean(query.date_from);
  const hasTo = Boolean(query.date_to);

  if (hasFrom !== hasTo) {
    throw new BadRequestException(
      'date_from and date_to must be provided together',
    );
  }

  if (hasFrom && hasTo) {
    return getDaysInRange(
      toPrismaDateOnly(query.date_from!),
      toPrismaDateOnly(query.date_to!),
    );
  }

  return getLast30Days();
};

type AttendanceReportStatus = 'on_time' | 'late';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.assertWorkerAndBranch(cId, dto.employeeId, dto.branchId);

    const date = toPrismaDateOnly(dto.date);
    const timestamp = combineDateAndTime(dto.date, dto.time);
    const isCheckIn = dto.type === 'check-in';

    const existing = await this.prisma.attendance.findUnique({
      where: {
        worker_id_date: {
          worker_id: dto.employeeId,
          date,
        },
      },
    });

    if (existing && existing.company_id !== cId) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Attendance'),
      );
    }

    try {
      if (existing) {
        return await this.prisma.attendance.update({
          where: { id: existing.id },
          data: {
            deleted_at: null,
            ...(isCheckIn
              ? { check_in_at: timestamp }
              : { check_out_at: timestamp }),
            description: dto.description ?? existing.description,
            branch_id: dto.branchId,
            resource: attendance_resource.manual,
          },
          include: { worker: true, branch: true },
        });
      }

      return await this.prisma.attendance.create({
        data: {
          company_id: cId,
          date,
          worker_id: dto.employeeId,
          branch_id: dto.branchId,
          description: dto.description ?? null,
          resource: attendance_resource.manual,
          check_in_at: isCheckIn ? timestamp : null,
          check_out_at: isCheckIn ? null : timestamp,
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

  async report(query: IAttendanceReportQuery, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    const targetDate = toPrismaDateOnly(query.date ?? new Date().toISOString());
    const weekday = targetDate.getUTCDay() === 0 ? 7 : targetDate.getUTCDay();

    const where: Prisma.attendanceWhereInput = {
      deleted_at: null,
      company_id: cId,
      check_in_at: { not: null },
      date: targetDate,
    };

    const workerWhere: Prisma.workerWhereInput = {};
    if (query?.department_id) {
      workerWhere.department_id = +query.department_id;
    }
    if (query?.filial_id) {
      workerWhere.filial_id = +query.filial_id;
    }
    if (Object.keys(workerWhere).length > 0) {
      where.worker = workerWhere;
    }

    const records = await this.prisma.attendance.findMany({
      where,
      orderBy: { created_at: query?.order_by === 'asc' ? 'asc' : 'desc' },
      include: {
        worker: {
          include: {
            user: {
              select: { first_name: true, last_name: true },
            },
            position: {
              select: { title_uz: true, title_ru: true, title_en: true },
            },
            schedule: {
              where: { deleted_at: null },
              include: {
                days: {
                  where: { day: weekday, deleted_at: null },
                },
              },
            },
          },
        },
      },
    });

    return records.map((record) => {
      const daySchedule = record.worker.schedule?.days?.[0];
      let status: AttendanceReportStatus = 'late';

      if (daySchedule && record.check_in_at) {
        const arrivalMinutes = timeToMinutes(record.check_in_at);
        const startMinutes = timeToMinutes(daySchedule.start_time);
        status = arrivalMinutes <= startMinutes ? 'on_time' : 'late';
      }

      return {
        id: record.worker.id,
        user: {
          first_name: record.worker.user.first_name,
          last_name: record.worker.user.last_name,
          position: record.worker.position
            ? {
                title_uz: record.worker.position.title_uz,
                title_ru: record.worker.position.title_ru,
                title_en: record.worker.position.title_en,
              }
            : null,
        },
        status,
      };
    });
  }

  async chart(
    query: IAttendanceChartQuery,
    companyId: number | null,
  ): Promise<AttendanceChartRow[]> {
    return this.getChartData(query, requireCompanyId(companyId));
  }

  async downloadChartExcel(
    query: IAttendanceChartQuery,
    companyId: number | null,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const rows = await this.getChartData(query, requireCompanyId(companyId));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Nazoratchi';
    const sheet = workbook.addWorksheet('Attendance chart');

    sheet.columns = [
      { header: '№', key: 'id', width: 8 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'On time', key: 'on_time', width: 12 },
      { header: 'Late', key: 'late', width: 12 },
      { header: 'Not work', key: 'not_work', width: 14 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const row of rows) {
      sheet.addRow({
        id: row.id,
        date: row.date.slice(0, 10),
        on_time: row.on_time,
        late: row.late,
        not_work: row.not_work,
      });
    }

    const raw = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(raw);

    const from = query.date_from?.slice(0, 10);
    const to = query.date_to?.slice(0, 10);
    const suffix =
      from && to ? `${from}_${to}` : new Date().toISOString().slice(0, 10);
    const filename = `attendance-chart-${suffix}.xlsx`;

    return { buffer, filename };
  }

  private async getChartData(
    query: IAttendanceChartQuery,
    cId: number,
  ): Promise<AttendanceChartRow[]> {
    const dates = getChartDates(query);

    const workerWhere: Prisma.workerWhereInput = {
      deleted_at: null,
      company_id: cId,
    };
    if (query?.department_id) {
      workerWhere.department_id = +query.department_id;
    }
    if (query?.filial_id) {
      workerWhere.filial_id = +query.filial_id;
    }

    const workers = await this.prisma.worker.findMany({
      where: workerWhere,
      include: {
        schedule: {
          where: { deleted_at: null },
          include: { days: { where: { deleted_at: null } } },
        },
      },
    });

    if (dates.length === 0) {
      return [];
    }

    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    const workerIds = workers.map((w) => w.id);

    const attendances =
      workerIds.length === 0
        ? []
        : await this.prisma.attendance.findMany({
            where: {
              deleted_at: null,
              company_id: cId,
              date: { gte: minDate, lte: maxDate },
              worker_id: { in: workerIds },
            },
          });

    const attendanceByWorkerDate = new Map<
      string,
      (typeof attendances)[number]
    >();
    for (const a of attendances) {
      const key = `${a.worker_id}-${a.date.toISOString().slice(0, 10)}`;
      attendanceByWorkerDate.set(key, a);
    }

    return dates.map((date, index) => {
      const weekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
      let on_time = 0;
      let late = 0;
      let not_work = 0;

      for (const worker of workers) {
        const daySchedule = worker.schedule?.days.find(
          (d) => d.day === weekday,
        );
        if (!daySchedule) continue;

        const key = `${worker.id}-${date.toISOString().slice(0, 10)}`;
        const attendance = attendanceByWorkerDate.get(key);

        if (!attendance?.check_in_at) {
          not_work++;
          continue;
        }

        const arrivalMinutes = timeToMinutes(attendance.check_in_at);
        const startMinutes = timeToMinutes(daySchedule.start_time);
        if (arrivalMinutes <= startMinutes) {
          on_time++;
        } else {
          late++;
        }
      }

      return {
        id: index + 1,
        date: date.toISOString(),
        on_time,
        late,
        not_work,
      };
    });
  }

  async getDashboardAttendance(
    query: IAttendanceDashboardQuery,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);
    const where: Prisma.attendanceWhereInput = {
      deleted_at: null,
      company_id: cId,
    };

    const workerWhere: Prisma.workerWhereInput = {};
    if (query?.department_id) {
      workerWhere.department_id = +query.department_id;
    }
    if (query?.filial_id) {
      workerWhere.filial_id = +query.filial_id;
    }
    if (Object.keys(workerWhere).length > 0) {
      where.worker = workerWhere;
    }

    if (query?.date) {
      where.date = toPrismaDateOnly(query.date);
    }

    const orderBy: Prisma.attendanceOrderByWithRelationInput = {
      created_at: query?.order_by === 'asc' ? 'asc' : 'desc',
    };

    const records = await this.prisma.attendance.findMany({
      where,
      orderBy,
      take: 5,
      include: {
        worker: {
          include: {
            user: {
              select: {
                avatar: true,
                first_name: true,
                last_name: true,
                username: true,
              },
            },
            position: {
              select: {
                title_uz: true,
                title_ru: true,
                title_en: true,
              },
            },
          },
        },
      },
    });

    return records.map((record) => ({
      id: record.worker.id,
      user: {
        avatar: record.worker.user.avatar,
        first_name: record.worker.user.first_name,
        last_name: record.worker.user.last_name,
        username: record.worker.user.username,
        position: record.worker.position
          ? {
              title_uz: record.worker.position.title_uz,
              title_ru: record.worker.position.title_ru,
              title_en: record.worker.position.title_en,
            }
          : null,
      },
      check_in: record.check_in_at?.toISOString() ?? null,
      check_out: record.check_out_at?.toISOString() ?? null,
      total:
        record.check_in_at && record.check_out_at
          ? formatTotalHours(record.check_in_at, record.check_out_at)
          : null,
      resource: record.resource,
    }));
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
    if (dto.time !== undefined && dto.type !== undefined) {
      const timestamp = toTimestamp(dto.time);
      if (dto.type === 'check-in') {
        data.check_in_at = timestamp;
      } else {
        data.check_out_at = timestamp;
      }
    }
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
