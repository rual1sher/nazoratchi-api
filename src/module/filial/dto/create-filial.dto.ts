import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class CreateFilialDto {
  @IsString()
  title_uz: string;

  @IsString()
  title_ru: string;

  @IsString()
  title_en: string;

  @IsNumber()
  company_id: number;

  @ArrayNotEmpty()
  @IsArray()
  @IsArray({ each: true })
  coordinates: number[][];
}
