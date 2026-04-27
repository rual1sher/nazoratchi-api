import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '998901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
