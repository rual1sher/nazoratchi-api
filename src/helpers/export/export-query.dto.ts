import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toStringArray = (value: unknown): string[] | undefined => {
  if (value == null || value === '') return undefined;
  if (Array.isArray(value)) {
    const arr = value.map(String).filter(Boolean);
    return arr.length ? arr : undefined;
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
};

export class ExportBaseQueryDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  date_from: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  date_to: string;

  @ApiProperty({ example: '3', description: 'Filial id' })
  @IsString()
  @IsNotEmpty()
  filial: string;
}

export class PaymentExportQueryDto extends ExportBaseQueryDto {
  @ApiPropertyOptional({
    example: ['1', '2'],
    type: [String],
    description: 'Worker ids. If omitted, all workers in filial are used.',
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  workers?: string[];
}

export class AttendanceExportQueryDto extends ExportBaseQueryDto {
  @ApiPropertyOptional({
    example: ['1', '2'],
    type: [String],
    description: 'Department ids. If omitted, all workers in filial are used.',
  })
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  departments?: string[];
}
