import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreatePenaltyItemDto {
  @ApiProperty({ example: 'late' })
  @IsString()
  type: string;

  @ApiProperty({ example: '15m' })
  @IsString()
  @Matches(/^\d+m$/, {
    message: 'time must be in Xm format, for example 15m',
  })
  time: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Late by 15 mins' })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class CreatePenaltyDto {
  @ApiProperty({ example: 'Late penalties' })
  @IsString()
  name: string;

  @ApiProperty({ type: [CreatePenaltyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePenaltyItemDto)
  penalties: CreatePenaltyItemDto[];
}
