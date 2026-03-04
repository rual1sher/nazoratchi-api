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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IDepartmentQuery } from 'src/helpers/types/types';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';

@Controller('department')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @WorkerId() workerId: string,
  ) {
    const data = await this.departmentService.create(
      createDepartmentDto,
      +workerId,
    );
    return new ApiResponse(data);
  }

  @Get()
  async findAll(
    @Query() query: IDepartmentQuery,
    @WorkerId() workerId: string,
  ) {
    const { department, pagination } = await this.departmentService.findAll(
      query,
      +workerId,
    );
    return new ApiResponse(department, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.departmentService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    const data = await this.departmentService.update(+id, updateDepartmentDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.departmentService.remove(+id);
    return new ApiResponse(data);
  }
}
