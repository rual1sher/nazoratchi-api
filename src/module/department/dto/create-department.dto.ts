import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'IT bo`limi', description: 'Uzbek title' })
  @IsString()
  title_uz: string;

  @ApiProperty({ example: 'IT отдел', description: 'Russian title' })
  @IsString()
  title_ru: string;

  @ApiProperty({ example: 'IT Department', description: 'English title' })
  @IsString()
  title_en: string;
}
