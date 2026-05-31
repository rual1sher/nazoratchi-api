import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { salary_type } from 'prisma/generated/prisma/client';

export class CreateSalaryDto {
  @ApiProperty({ example: 5000, description: 'Amount of salary' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    enum: salary_type,
    example: salary_type.monthly,
    description: 'Type of salary (month, day, hours)',
  })
  @IsEnum(salary_type)
  @IsNotEmpty()
  type: salary_type;

  @ApiProperty({
    example: '2026-04-24T00:00:00Z',
    description: 'Date and time of salary record',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: true, description: 'Fixed salary' })
  @IsBoolean()
  @IsNotEmpty()
  fixed: boolean;
}
