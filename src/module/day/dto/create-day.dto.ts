import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateDayDto {
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
  start_time: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  end_time: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  break_start?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  break_end?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  schedule_id: number;
}
