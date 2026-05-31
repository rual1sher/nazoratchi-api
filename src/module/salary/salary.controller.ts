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
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { ISalaryQuery } from 'src/helpers/types/types';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@ApiTags('Salary')
@Controller('salary')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @ApiOperation({ summary: 'Create new salary record' })
  async create(
    @Body() createSalaryDto: CreateSalaryDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.salaryService.create(createSalaryDto, companyId);
    return new ApiResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary records' })
  async findAll(
    @Query() query: ISalaryQuery,
    @CompanyId() companyId: number,
  ) {
    const { salary, pagination } = await this.salaryService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(salary, 200, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a salary record by id' })
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.salaryService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a salary record' })
  async update(
    @Param('id') id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.salaryService.update(
      +id,
      updateSalaryDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a salary record' })
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.salaryService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
