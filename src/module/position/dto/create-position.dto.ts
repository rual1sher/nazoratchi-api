import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  title_uz: string;

  @IsString()
  title_ru: string;

  @IsString()
  title_en: string;

  @IsNumber()
  @IsOptional()
  company_id: number;
}
