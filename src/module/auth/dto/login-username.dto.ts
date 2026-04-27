import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUsernameDto {
  @ApiProperty({ example: 'admin_user', description: 'Unique username' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}
