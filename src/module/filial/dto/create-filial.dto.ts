import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

export class CreateFilialDto {
  @IsString()
  title: string;

  @IsNumber()
  company_id: number;

  @ArrayNotEmpty()
  @IsArray()
  @IsArray({ each: true })
  coordinates: number[][];
}
