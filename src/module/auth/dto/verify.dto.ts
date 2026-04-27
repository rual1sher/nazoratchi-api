import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty({ example: '998901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 123456 })
  @IsNumber()
  code: number;
}
