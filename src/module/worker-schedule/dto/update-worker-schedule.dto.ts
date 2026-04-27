import { PartialType } from '@nestjs/swagger';
import { CreateWorkerScheduleDto } from './create-worker-schedule.dto';

export class UpdateWorkerScheduleDto extends PartialType(CreateWorkerScheduleDto) {}
