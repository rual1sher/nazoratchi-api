import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  penalties_name_type,
  penalty_type,
} from 'prisma/generated/prisma/enums';

class CreatePenaltyItemDto {
  @ApiProperty({ example: penalty_type.late_arrival })
  @IsEnum(penalty_type, { message: 'Invalid type' })
  type: penalty_type;

  @ApiProperty({ example: 15 })
  @IsNumber()
  min_minutes: number;

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

  @ApiProperty({ example: 'active' })
  @IsEnum(penalties_name_type, { message: 'Invalid type' })
  type: penalties_name_type;

  @ApiProperty({ type: [CreatePenaltyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePenaltyItemDto)
  penalties: CreatePenaltyItemDto[];
}
