import { IsInt, IsNumber, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateWorkerScheduleDto {
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

  @ApiProperty({ example: '13:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  break_start: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  break_end: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  day_id: number;
}
