import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiPropertyOptional({ example: 'avatar_url_here.jpg', description: 'User avatar URL' })
  @IsString()
  @IsOptional()
  avatar: string;

  @ApiProperty({ example: 'Alisher', description: 'User first name' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Olimov', description: 'User last name' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: '998901234567', description: 'User phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}
