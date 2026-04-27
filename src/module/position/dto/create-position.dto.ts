import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePositionDto {
  @ApiProperty({ example: 'Dasturchi', description: 'Uzbek title' })
  @IsString()
  title_uz: string;

  @ApiProperty({ example: 'Программист', description: 'Russian title' })
  @IsString()
  title_ru: string;

  @ApiProperty({ example: 'Developer', description: 'English title' })
  @IsString()
  title_en: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  department_id: number;
}
