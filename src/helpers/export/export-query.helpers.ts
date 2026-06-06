import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { ExportBaseQueryDto } from './export-query.dto';

export const toPrismaDateOnly = (value: string): Date => {
  const d = new Date(isNaN(Number(value)) ? value : Number(value));
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('Invalid date');
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

export const parseExportDateRange = (query: ExportBaseQueryDto) => {
  const dateFrom = toPrismaDateOnly(query.date_from);
  const dateTo = toPrismaDateOnly(query.date_to);
  if (dateFrom.getTime() > dateTo.getTime()) {
    throw new BadRequestException(
      'date_from must be before or equal to date_to',
    );
  }
  return { dateFrom, dateTo };
};

export const assertExportFilial = async (
  prisma: PrismaService,
  companyId: number,
  filial: string,
) => {
  const filialId = Number(filial);
  if (Number.isNaN(filialId)) {
    throw new BadRequestException('Invalid filial');
  }

  const branch = await prisma.filial.findFirst({
    where: { id: filialId, company_id: companyId, deleted_at: null },
  });
  if (!branch) {
    throw new NotFoundException(
      ErrorMessages.notFound.modelNotFound('Filial'),
    );
  }

  return filialId;
};

export const resolveExportWorkerIds = async (
  prisma: PrismaService,
  companyId: number,
  filialId: number,
  workers?: string[],
): Promise<number[] | undefined> => {
  if (!workers?.length) {
    return undefined;
  }

  const workerIds = workers
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  if (!workerIds.length) {
    return undefined;
  }

  const found = await prisma.worker.findMany({
    where: {
      id: { in: workerIds },
      company_id: companyId,
      filial_id: filialId,
      deleted_at: null,
    },
    select: { id: true },
  });

  if (found.length !== workerIds.length) {
    throw new BadRequestException(
      'One or more workers are invalid or do not belong to this filial',
    );
  }

  return workerIds;
};

export const resolveExportWorkerIdsByDepartments = async (
  prisma: PrismaService,
  companyId: number,
  filialId: number,
  departments?: string[],
): Promise<number[] | undefined> => {
  if (!departments?.length) {
    return undefined;
  }

  const departmentIds = departments
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  if (!departmentIds.length) {
    return undefined;
  }

  const foundDepartments = await prisma.department.findMany({
    where: {
      id: { in: departmentIds },
      company_id: companyId,
      deleted_at: null,
    },
    select: { id: true },
  });

  if (foundDepartments.length !== departmentIds.length) {
    throw new BadRequestException(
      'One or more departments are invalid or do not belong to this company',
    );
  }

  const workers = await prisma.worker.findMany({
    where: {
      company_id: companyId,
      filial_id: filialId,
      department_id: { in: departmentIds },
      deleted_at: null,
    },
    select: { id: true },
  });

  return workers.map((w) => w.id);
};
