import { PartialType } from '@nestjs/swagger';
import { CreatePenaltyDto } from './create-penalty.dto';

export class UpdatePenaltyDto extends PartialType(CreatePenaltyDto) {}
