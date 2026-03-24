import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { payment_type } from 'prisma/generated/prisma/enums';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsEnum(payment_type)
  type: payment_type;

  @IsNumber()
  worker_id: number;
}
