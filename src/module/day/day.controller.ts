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
import { DayService } from './day.service';
import { CreateDayDto } from './dto/create-day.dto';
import { UpdateDayDto } from './dto/update-day.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';
import { IDayQuery } from 'src/helpers/types/types';

@Controller('day')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class DayController {
  constructor(private readonly dayService: DayService) {}

  @Post()
  async create(
    @Body() createDayDto: CreateDayDto,
    @WorkerId() workerId: string,
  ) {
    const data = await this.dayService.create(createDayDto, +workerId);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: IDayQuery, @WorkerId() workerId: string) {
    const { day, pagination } = await this.dayService.findAll(query, +workerId);
    return new ApiResponse(day, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.dayService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDayDto: UpdateDayDto,
    @WorkerId() workerId: string,
  ) {
    const data = await this.dayService.update(+id, updateDayDto, +workerId);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @WorkerId() workerId: string) {
    const data = await this.dayService.remove(+id, +workerId);
    return new ApiResponse(data);
  }
}
