import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { worker_schedule_type } from 'prisma/generated/prisma/enums';
import { Type } from 'class-transformer';

const SCHEDULE_TYPES = Object.values(worker_schedule_type);

type WorkerScheduleType =
  (typeof worker_schedule_type)[keyof typeof worker_schedule_type];

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

  @ApiPropertyOptional({
    description:
      'Филиалы (multi-select). Пустой массив или отсутствие поля — праздник для всех филиалов компании.',
    example: [1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  filial_ids?: number[];

  @ApiPropertyOptional({
    description:
      'Отделы (multi-select). Пустой массив или отсутствие поля — для всех отделов.',
    example: [1],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  department_ids?: number[];

  @ApiPropertyOptional({
    description:
      'Типы графика worker_schedule (multi-select). Пустой массив или отсутствие поля — для всех типов.',
    enum: worker_schedule_type,
    isArray: true,
    example: ['adaptive', 'free'],
  })
  @IsOptional()
  @IsArray()
  @IsIn(SCHEDULE_TYPES, { each: true })
  schedule_types?: WorkerScheduleType[];
}
