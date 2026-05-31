import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateTerminalDto {
  @ApiProperty({ example: 'Kassa 1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'TERM_ABC123' })
  @IsString()
  unique_id: string;

  @ApiProperty({ example: '00:1A:2B:3C:4D:5E' })
  @IsString()
  mac_address: string;

  @ApiProperty({ example: 1, description: 'Filial (branch) id' })
  @IsInt()
  @Min(1)
  filial_id: number;
}
