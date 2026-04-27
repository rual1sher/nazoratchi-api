import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { penalty_type } from "prisma/generated/prisma/enums";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreatePenaltyDto {
  @ApiProperty({ example: 50 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Late by 15 mins' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  min_minutes: number;

  @ApiProperty({ enum: penalty_type })
  @IsEnum(penalty_type)
  type: penalty_type;

  @ApiProperty({ example: 1 })
  @IsNumber()
  penalties_name_id: number;
}
