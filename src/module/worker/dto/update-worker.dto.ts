import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { worker_role } from 'prisma/generated/prisma/enums';

export class UpdateWorkerDto {
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsNumber()
  company_id?: number;

  @IsOptional()
  @IsNumber()
  position_id?: number;

  @IsOptional()
  @IsNumber()
  department_id?: number;

  @IsOptional()
  @IsNumber()
  day_id?: number;

  @IsOptional()
  @IsEnum(worker_role)
  role?: worker_role;
}
