import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPhoneDto {
  @ApiProperty({ example: '998901234567', description: 'User phone number' })
  @IsString()
  phone: string;
}
