import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from 'src/module/user/dto/create-user.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { worker_role } from 'prisma/generated/prisma/enums';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateWorkerDto {
  @ApiPropertyOptional({ type: () => OmitType(CreateUserDto, ['password']) })
  @ValidateNested()
  @IsNotEmpty()
  @IsOptional()
  @Type(() => OmitType(CreateUserDto, ['password']))
  user?: CreateUserDto & { password?: string };

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  position_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  department_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  schedule_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  filial_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  salary_id?: number;

  @ApiProperty({ enum: worker_role })
  @IsOptional()
  @IsEnum(worker_role)
  role?: worker_role;
}
