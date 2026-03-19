import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { penalty_type } from "prisma/generated/prisma/enums";

export class CreatePenaltyDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  min_minutes: number;

  @IsEnum(penalty_type)
  type: penalty_type

  @IsNumber()
  penalties_name_id: number;
}
