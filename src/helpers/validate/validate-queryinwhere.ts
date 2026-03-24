import { BadRequestException } from '@nestjs/common';
import { ErrorMessages } from '../error/error.message';

const whereRecord: Record<string, { value: string }> = {
  companyId: { value: 'company_id' },
  userId: { value: 'user_id' },
  positionId: { value: 'position_id' },
  departmentId: { value: 'department_id' },
  dayId: { value: 'day_id' },
  filialId: { value: 'filial_id' },
  workerId: { value: 'worker_id' },
  penaltyId: { value: 'penalty_id' },
  scheduleId: { value: 'schedule_id' },
  penaltysNameId: { value: 'penalties_name_id' },
};

export function QueryWhere(query: any, where: any) {
  for (const [field, value] of Object.entries(query)) {
    if (value == null) continue;

    if (field.endsWith('Id')) {
      const rel = whereRecord[field];

      if (!Number(value)) {
        throw new BadRequestException(ErrorMessages.badRequest.invalid(field));
      }

      where[rel.value] = Number(value);
      continue;
    }

    where[field] = value;
  }
}
