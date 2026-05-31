import { IsISO8601, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessDailyPenaltiesQueryDto {
  @ApiPropertyOptional({
    example: '2026-05-30T00:00:00.000Z',
    description:
      'Calendar day to process (defaults to yesterday, same as midnight cron)',
  })
  @IsISO8601()
  @IsOptional()
  date?: string;
}
