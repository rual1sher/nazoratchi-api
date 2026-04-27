import { PartialType } from '@nestjs/swagger';
import { CreatePenaltysNameDto } from './create-penaltys-name.dto';

export class UpdatePenaltysNameDto extends PartialType(CreatePenaltysNameDto) {}
