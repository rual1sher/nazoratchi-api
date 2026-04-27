import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'old_password123' })
  @IsString()
  old_password: string;

  @ApiProperty({ example: 'new_password123' })
  @IsString()
  new_password: string;
}
