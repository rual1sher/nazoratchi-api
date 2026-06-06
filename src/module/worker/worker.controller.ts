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
  IQuery,
  IMyWorkerAttendanceQuery,
  IWorkerMonitoringQuery,
} from 'src/helpers/types/types';
import { payment_type, worker_role } from 'prisma/generated/prisma/enums';
import { Owner } from 'src/helpers/decorators/owner.decorator';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';

@ApiTags('employee')
@Controller('employee')
@UseGuards(AuthGuard, WorkerRolesGuard)
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @WorkerRoles(worker_role.maneger)
  @Post()
  @ApiOperation({ summary: 'Create a new employee' })
  async create(
    @Body() createWorkerDto: CreateWorkerDto,
    @Owner() { role }: IPayload,
    @CompanyId() companyId: number | null,
  ) {
    const data = await this.workerService.create(
      createWorkerDto,
      role,
      companyId,
    );
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  async findAll(
    @Query() query: IWorkerQuery,
    @CompanyId() companyId: number | null,
  ) {
    const { worker, pagination } = await this.workerService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(worker, 200, pagination);
  }

  @WorkerRoles(worker_role.maneger)
  @Get('monitoring')
  @ApiOperation({
    summary: 'Get employees monitoring (on_time / late / not_work)',
  })
  async monitoring(
    @Query() query: IWorkerMonitoringQuery,
    @CompanyId() companyId: number | null,
  ) {
    const { worker, pagination } = await this.workerService.monitoring(
      query,
      companyId,
    );
    return new ApiResponse(worker, 200, pagination);
  }

  @WorkerRoles(worker_role.maneger)
  @Get(':id/payments')
  @ApiOperation({})
  async workerPayments(
    @Param('id') id: string,
    @Query() query: IQuery,
    @CompanyId() companyId: number,
  ) {
    const { payment, pagination } = await this.workerService.getMyPayments(
      [payment_type.bonus, payment_type.income],
      companyId,
      Number(id),
      query,
    );
    return new ApiResponse(payment, 200, pagination);
  }

  @WorkerRoles(worker_role.worker)
  @Get('my/penalty')
  @ApiOperation({ summary: 'Get my penalties' })
  async getMyPenalties(
    @CompanyId() companyId: number,
    @WorkerId() workerId: number | null,
    @Query() query: IQuery,
  ) {
    const { payment, pagination } = await this.workerService.getMyPayments(
      [payment_type.penalty],
      companyId,
      workerId,
      query,
    );
    return new ApiResponse(payment, 200, pagination);
  }

  @WorkerRoles(worker_role.worker)
  @Get('my/bonus')
  @ApiOperation({ summary: 'Get my bonuses' })
  async getMyBonuses(
    @CompanyId() companyId: number,
    @WorkerId() workerId: number | null,
    @Query() query: IQuery,
  ) {
    const { payment, pagination } = await this.workerService.getMyPayments(
      [payment_type.bonus, payment_type.income],
      companyId,
      workerId,
      query,
    );
    return new ApiResponse(payment, 200, pagination);
  }

  @WorkerRoles(worker_role.worker)
  @Get('my/attendance')
  @ApiOperation({ summary: 'Get my attendance' })
  async getMyAttendance(
    @CompanyId() companyId: number,
    @WorkerId() workerId: number | null,
    @Query() query: IMyWorkerAttendanceQuery,
  ) {
    const data = await this.workerService.getMyAttendance(
      query,
      companyId,
      workerId,
    );
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @ApiOperation({ summary: 'Get worker attendance' })
  @Get(':id/attendance')
  async getWorkerAttendance(
    @Param('id') id: string,
    @Query() query: { date: string },
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerService.getWorkerAttendance(
      +id,
      companyId,
      query.date,
    );
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @ApiOperation({ summary: 'Get dashboard workers' })
  @Get('dashboard')
  async getDashboardWorkers(
    @Query() query: IDashboardWorkerQuery,
    @CompanyId() companyId: number,
  ) {
    const data = await this.workerService.getDashboardWorkers(query, companyId);
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by id' })
  async findOne(
    @Param('id') id: string,
    @CompanyId() companyId: number | null,
  ) {
    const data = await this.workerService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkerDto: UpdateWorkerDto,
    @CompanyId() companyId: number | null,
  ) {
    const data = await this.workerService.update(
      +id,
      updateWorkerDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @WorkerRoles(worker_role.maneger)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an employee' })
  async remove(@Param('id') id: string, @CompanyId() companyId: number | null) {
    const data = await this.workerService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
