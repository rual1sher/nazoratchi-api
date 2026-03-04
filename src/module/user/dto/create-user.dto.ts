import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  avatar: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;
}
