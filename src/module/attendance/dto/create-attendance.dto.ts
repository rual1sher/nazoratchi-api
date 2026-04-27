import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: '2026-04-24T00:00:00Z', description: 'Date of attendance' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 1, description: 'ID of the worker' })
  @IsInt()
  @IsNotEmpty()
  worker_id: number;

  @ApiPropertyOptional({ example: '2026-04-24T09:00:00Z', description: 'Arrival time' })
  @IsDateString()
  @IsOptional()
  arrival_at?: string;

  @ApiPropertyOptional({ example: '2026-04-24T18:00:00Z', description: 'Departure time' })
  @IsDateString()
  @IsOptional()
  departure_at?: string;
}
