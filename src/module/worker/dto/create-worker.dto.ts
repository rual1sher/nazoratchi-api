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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateWorkerDto {
  @ApiPropertyOptional({ type: () => CreateUserDto })
  @ValidateNested()
  @IsOptional()
  @IsNotEmpty()
  @Type(() => CreateUserDto)
  user?: CreateUserDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  company_id: number;

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
  day_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  filial_id?: number;

  @ApiProperty({ enum: worker_role })
  @IsOptional()
  @IsEnum(worker_role)
  role: worker_role;
}
