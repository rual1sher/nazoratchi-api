import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateFilialDto {
  @ApiProperty({ example: 'Asosiy filial', description: 'Uzbek title' })
  @IsString()
  title_uz: string;

  @ApiProperty({ example: 'Главный филиал', description: 'Russian title' })
  @IsString()
  title_ru: string;

  @ApiProperty({ example: 'Main Branch', description: 'English title' })
  @IsString()
  title_en: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  company_id: number;

  @ApiProperty({ example: [[41.2995, 69.2401]], description: 'Array of coordinates' })
  @ArrayNotEmpty()
  @IsArray()
  @IsArray({ each: true })
  coordinates: number[][];
}
