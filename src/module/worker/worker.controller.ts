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
import {
  IPayload,
  IWorkerQuery,
  IDashboardWorkerQuery,
} from 'src/helpers/types/types';
import { worker_role } from 'prisma/generated/prisma/enums';
import { Owner } from 'src/helpers/decorators/owner.decorator';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@Controller('worker')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  async create(
    @Body() createWorkerDto: CreateWorkerDto,
    @Owner() { role }: IPayload,
  ) {
    const data = await this.workerService.create(createWorkerDto, role);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: IWorkerQuery, @CompanyId() companyId: number) {
    const { worker, pagination } = await this.workerService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(worker, 200, pagination);
  }

  @Get('dashboard')
  async getDashboardWorkers(
    @Query() query: IDashboardWorkerQuery,
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerService.getDashboardWorkers(query, companyId);
    return new ApiResponse(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.workerService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
  ) {
    const data = await this.workerService.update(+id, updateWorkerDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.workerService.remove(+id);
    return new ApiResponse(data);
  }
}
