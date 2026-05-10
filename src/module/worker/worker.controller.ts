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
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { IPayload, IWorkerQuery } from 'src/helpers/types/types';
import { worker_role } from 'prisma/generated/prisma/enums';
import { Owner } from 'src/helpers/decorators/owner.decorator';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('employee')
@Controller('employee')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  async create(
    @Body() createWorkerDto: CreateWorkerDto,
    @Owner() { role }: IPayload,
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerService.create(
      createWorkerDto,
      role,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  async findAll(@Query() query: IWorkerQuery, @CompanyId() companyId: number) {
    const { worker, pagination } = await this.workerService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(worker, 200, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by id' })
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.workerService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerService.update(
      +id,
      updateWorkerDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an employee' })
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.workerService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
