import { IsInt, IsNumber, IsString, Matches, Max, Min } from 'class-validator';

export class CreateWorkerScheduleDto {
  @IsInt()
  @Min(1)
  @Max(7)
  day: number;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  start_time: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  end_time: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  break_start: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Время должно быть от 00:00 до 23:59 (например 09:30)',
  })
  break_end: string;

  @IsNumber()
  day_id: number;
}
