import { IsNumber, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Two decimal numbers separated by a comma: lat,lng (optional spaces). */
const COORDINATE_LAT_LNG =
  /^\s*[-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?\s*$/;

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

  @ApiProperty({
    example: '41.2995, 69.2401',
    description: 'Single point as "latitude,longitude"',
  })
  @IsString()
  @Matches(COORDINATE_LAT_LNG, {
    message: 'coordinate must be "lat,lng" (e.g. 41.2995,69.2401)',
  })
  coordinate: string;
}
