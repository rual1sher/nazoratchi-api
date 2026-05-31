import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { worker_schedule_type } from 'prisma/generated/prisma/enums';

class CreateWorkerScheduleDayItemDto {
  @ApiProperty({ example: 1, description: '1 for Monday, 7 for Sunday' })
  @IsInt()
  @Min(1)
  @Max(7)
  day: number;

  @ApiProperty({
    example: '2026-05-10T09:00:00.000Z',
    description: 'Shift start (ISO 8601); only time-of-day is stored',
  })
  @IsISO8601()
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    example: '2026-05-10T18:00:00.000Z',
    description: 'Shift end (ISO 8601); only time-of-day is stored',
  })
  @IsISO8601()
  @IsNotEmpty()
  end: string;

  @ApiPropertyOptional({
    example: '2026-05-10T13:00:00.000Z',
    description: 'Break start (ISO 8601); only time-of-day is stored',
  })
  @IsOptional()
  @IsISO8601()
  breakStart?: string;

  @ApiPropertyOptional({
    example: '2026-05-10T14:00:00.000Z',
    description: 'Break end (ISO 8601); only time-of-day is stored',
  })
  @IsOptional()
  @IsISO8601()
  breakEnd?: string;
}

export class CreateWorkerScheduleDto {
  @ApiProperty({ example: 'test' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'adaptive' })
  @IsEnum(worker_schedule_type)
  type: worker_schedule_type;

  @ApiPropertyOptional({ example: '2026-05-08' })
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @ApiPropertyOptional({ example: 7 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(7)
  daysFrequency?: number;

  @ApiPropertyOptional({ type: [CreateWorkerScheduleDayItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkerScheduleDayItemDto)
  days?: CreateWorkerScheduleDayItemDto[];
}
