import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerScheduleDto } from './create-worker-schedule.dto';

export class UpdateWorkerScheduleDto extends PartialType(CreateWorkerScheduleDto) {}
