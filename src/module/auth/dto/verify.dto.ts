import { IsNumber, IsString } from 'class-validator';

export class VerifyDto {
  @IsString()
  phone: string;

  @IsNumber()
  code: number;
}
