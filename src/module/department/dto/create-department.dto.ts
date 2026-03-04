import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  company_id: number;
}
