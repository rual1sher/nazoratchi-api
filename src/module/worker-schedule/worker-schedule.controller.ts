import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WorkerScheduleService } from './worker-schedule.service';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { worker_role } from 'prisma/generated/prisma/enums';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { ApiResponse } from 'src/helpers/responce/api-responce';

@Controller('schedule')
@UseGuards(AuthGuard, WorkerRolesGuard)
export class WorkerScheduleController {
  constructor(private readonly workerScheduleService: WorkerScheduleService) {}

  @Post()
  @WorkerRoles(worker_role.maneger)
  async create(@Body() dto: CreateWorkerScheduleDto) {
    const data = await this.workerScheduleService.create(dto);
    return new ApiResponse(data);
  }

  @Get()
  findAll() {
    return this.workerScheduleService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkerScheduleDto: UpdateWorkerScheduleDto,
  ) {
    return this.workerScheduleService.update(+id, updateWorkerScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workerScheduleService.remove(+id);
  }
}
