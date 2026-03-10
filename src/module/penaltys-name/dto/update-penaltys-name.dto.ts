import { PartialType } from '@nestjs/mapped-types';
import { CreatePenaltysNameDto } from './create-penaltys-name.dto';

export class UpdatePenaltysNameDto extends PartialType(CreatePenaltysNameDto) {}
