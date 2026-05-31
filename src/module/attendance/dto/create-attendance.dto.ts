import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsISO8601,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const MANUAL_ATTENDANCE_TYPES = ['check-in', 'check-out'] as const;
export type ManualAttendanceType = (typeof MANUAL_ATTENDANCE_TYPES)[number];

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, description: 'Worker (employee) id' })
  @IsInt()
  @IsNotEmpty()
  employeeId: number;

  @ApiProperty({ example: 1, description: 'Branch (filial) id' })
  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @ApiProperty({
    example: '2026-05-10T00:00:00.000Z',
    description: 'Calendar date (ISO 8601); time part is ignored for storage',
  })
  @IsISO8601()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: '2026-05-10T09:15:00.000Z',
    description: 'Clock time (ISO 8601); only time-of-day is stored',
  })
  @IsISO8601()
  @IsNotEmpty()
  time: string;

  @ApiPropertyOptional({ example: 'Approved by manager' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: MANUAL_ATTENDANCE_TYPES, example: 'check-in' })
  @IsIn(MANUAL_ATTENDANCE_TYPES)
  @IsNotEmpty()
  type: ManualAttendanceType;
}
