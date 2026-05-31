import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { ITaskQuery } from 'src/helpers/types/types';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';

@ApiTags('Task')
@Controller('task')
@UseGuards(AuthGuard, WorkerRolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @WorkerRoles(worker_role.maneger)
  @ApiOperation({ summary: 'Create a new task' })
  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.taskService.create(createTaskDto, companyId);
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger, worker_role.worker)
  @ApiOperation({ summary: 'Get all tasks' })
  @Get()
  async findAll(
    @Query() query: ITaskQuery,
    @CompanyId() companyId: number,
    @WorkerId() workerId: number,
  ) {
    const { task, pagination } = await this.taskService.findAll(
      query,
      companyId,
      workerId,
    );
    return new ApiResponse(task, 200, pagination);
  }

  @WorkerRoles(worker_role.maneger, worker_role.worker)
  @ApiOperation({ summary: 'Get task by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.taskService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger, worker_role.worker)
  @ApiOperation({ summary: 'Update task' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.taskService.update(+id, updateTaskDto, companyId);
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @ApiOperation({ summary: 'Delete task' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.taskService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
