import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';

export class CreateWorkerDto {
  @ValidateNested()
  @IsOptional()
  @IsNotEmpty()
  @Type(() => CreateUserDto)
  user?: CreateUserDto;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsNumber()
  company_id: number;

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
  @IsNumber()
  filial_id?: number;

  @IsOptional()
  @IsEnum(worker_role)
  role: worker_role;
}
