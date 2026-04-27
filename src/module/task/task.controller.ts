import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { ITaskQuery } from 'src/helpers/types/types';
@ApiTags('Task')
@Controller('api/v1/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    const data = await this.taskService.create(createTaskDto);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Get all tasks' })
  @Get()
  async findAll(@Query() query: ITaskQuery) {
    const { task, pagination } = await this.taskService.findAll(query);
    return new ApiResponse(task, 200, pagination);
  }

  @ApiOperation({ summary: 'Get task by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.taskService.findOne(+id);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Update task' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    const data = await this.taskService.update(+id, updateTaskDto);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Delete task' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.taskService.remove(+id);
    return new ApiResponse(data);
  }
}
