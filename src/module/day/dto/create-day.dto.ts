import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDayDto {
  @IsString()
  title_uz: string;

  @IsString()
  title_ru: string;

  @IsString()
  title_en: string;

  @IsOptional()
  @IsNumber()
  company_id: number;
}
