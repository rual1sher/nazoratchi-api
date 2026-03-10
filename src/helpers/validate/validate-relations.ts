import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/prisma/internal/class';
import { ErrorMessages } from '../error/error.message';

const relationMap: Record<string, { model: keyof PrismaClient; name: string }> =
  {
    user_id: { model: 'user', name: 'User' },
    department_id: { model: 'department', name: 'Department' },
    position_id: { model: 'position', name: 'Position' },
    day_id: { model: 'day', name: 'Day' },
    company_id: { model: 'company', name: 'Company' },
    filial_id: { model: 'filial', name: 'Filial' },
    worker_id: { model: 'worker', name: 'Worker' },
    penalty_id: { model: 'penalty', name: 'Penalty' },
    schedule_id: { model: 'worker_schedule', name: 'Schedule' },
    penaltys_name_id: { model: 'penalties_name', name: 'PenaltysName' },
  };

export const validateRelations = async (prisma: PrismaClient, dto: any) => {
  for (const [field, value] of Object.entries(dto)) {
    const rel = relationMap[field];
    if (!rel || value == null) continue;

    const exists = await (prisma[rel.model] as any).findUnique({
      where: { id: value, deleted_at: null },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound(rel.name),
      );
    }
  }
};
