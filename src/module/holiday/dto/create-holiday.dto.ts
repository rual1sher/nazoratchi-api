import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ example: 'Yangi Yil' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Bayram kuni' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsBoolean()
  @IsOptional()
  yearly_loop?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  filial_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  department_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  position_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  schedule_id?: number;
}
