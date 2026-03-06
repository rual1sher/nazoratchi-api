import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDayDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  company_id: number;
}
