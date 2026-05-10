import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
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

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  start: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  end: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  breakStart?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
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
  @ValidateNested({ each: true })
  @Type(() => CreateWorkerScheduleDayItemDto)
  days?: CreateWorkerScheduleDayItemDto;
}
