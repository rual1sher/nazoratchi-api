import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WorkerScheduleService } from './worker-schedule.service';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { worker_role } from 'prisma/generated/prisma/enums';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IScheduleQuery } from 'src/helpers/types/types';

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
  async findAll(@Query() query: IScheduleQuery) {
    const { schedule, pagination } =
      await this.workerScheduleService.findAll(query);
    return new ApiResponse(schedule, 200, pagination);
  }

  @Patch(':id')
  @WorkerRoles(worker_role.maneger)
  async update(
    @Param('id') id: string,
    @Body() updateWorkerScheduleDto: UpdateWorkerScheduleDto,
  ) {
    const data = await this.workerScheduleService.update(
      +id,
      updateWorkerScheduleDto,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  @WorkerRoles(worker_role.maneger)
  async remove(@Param('id') id: string) {
    const data = await this.workerScheduleService.remove(+id);
    return new ApiResponse(data);
  }
}
