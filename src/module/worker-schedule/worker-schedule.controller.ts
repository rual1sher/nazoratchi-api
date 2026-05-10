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
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { WorkerScheduleService } from './worker-schedule.service';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { worker_role } from 'prisma/generated/prisma/enums';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IScheduleQuery } from 'src/helpers/types/types';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@Controller(['schedule', 'work-schedule'])
@UseGuards(AuthGuard, WorkerRolesGuard)
export class WorkerScheduleController {
  constructor(private readonly workerScheduleService: WorkerScheduleService) {}

  @Post()
  @WorkerRoles(worker_role.maneger)
  async create(
    @Body() dto: CreateWorkerScheduleDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerScheduleService.create(dto, companyId);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(
    @Query() query: IScheduleQuery,
    @Req() req: Request,
    @CompanyId() companyId: number,
  ) {
    // `baseUrl` is the selected controller route: `schedule` or `work-schedule`
    const baseUrl = (req as Request).baseUrl;

    if (baseUrl === 'work-schedule') {
      const { templates, pagination } =
        await this.workerScheduleService.findAllWorkScheduleTemplates(
          query,
          companyId,
        );
      return new ApiResponse(templates, 200, pagination);
    }

    const { schedule, pagination } =
      await this.workerScheduleService.findAll(query, companyId);
    return new ApiResponse(schedule, 200, pagination);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @CompanyId() companyId: number,
  ) {
    const baseUrl = (req as Request).baseUrl;

    if (baseUrl === 'work-schedule') {
      const data =
        await this.workerScheduleService.findOneWorkScheduleTemplateFromRowId(
          +id,
          companyId,
        );
      return new ApiResponse(data);
    }

    const data = await this.workerScheduleService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  @WorkerRoles(worker_role.maneger)
  async update(
    @Param('id') id: string,
    @Body() updateWorkerScheduleDto: UpdateWorkerScheduleDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerScheduleService.update(
      +id,
      updateWorkerScheduleDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  @WorkerRoles(worker_role.maneger)
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.workerScheduleService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
