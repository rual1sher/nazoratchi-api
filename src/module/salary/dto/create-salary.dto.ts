import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { salary_type } from 'prisma/generated/prisma/client';

export class CreateSalaryDto {
  @ApiProperty({ example: '5000', description: 'Amount of salary' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ enum: salary_type, example: salary_type.month, description: 'Type of salary (month, day, hours)' })
  @IsEnum(salary_type)
  @IsNotEmpty()
  type: salary_type;

  @ApiProperty({ example: '2026-04-24T00:00:00Z', description: 'Date and time of salary record' })
  @IsDateString()
  @IsNotEmpty()
  date_time: string;

  @ApiPropertyOptional({ example: true, description: 'Status of the salary (e.g. paid)' })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({ example: 1, description: 'ID of the worker' })
  @IsInt()
  @IsNotEmpty()
  worker_id: number;
}
