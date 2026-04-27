import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { payment_type } from 'prisma/generated/prisma/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreatePaymentDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Bonus payment' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ example: '2026-04-24T00:00:00Z' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ enum: payment_type })
  @IsEnum(payment_type)
  type: payment_type;

  @ApiProperty({ example: 1 })
  @IsNumber()
  worker_id: number;
}
