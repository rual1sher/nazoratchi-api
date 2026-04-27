import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateDayDto {
  @ApiProperty({ example: 'Dushanba', description: 'Uzbek title' })
  @IsString()
  title_uz: string;

  @ApiProperty({ example: 'Понедельник', description: 'Russian title' })
  @IsString()
  title_ru: string;

  @ApiProperty({ example: 'Monday', description: 'English title' })
  @IsString()
  title_en: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  company_id: number;
}
