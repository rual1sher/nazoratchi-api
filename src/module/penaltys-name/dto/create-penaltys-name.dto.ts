import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePenaltysNameDto {
  @ApiProperty({ example: 'Kechikish', description: 'Uzbek title' })
  @IsString()
  title_uz: string;

  @ApiProperty({ example: 'Опоздание', description: 'Russian title' })
  @IsString()
  title_ru: string;

  @ApiProperty({ example: 'Lateness', description: 'English title' })
  @IsString()
  title_en: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  company_id: number;
}
