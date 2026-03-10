import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateWorkerDto } from './create-worker.dto';

export class UpdateWorkerDto extends PartialType(
  OmitType(CreateWorkerDto, ['user']),
) {}
