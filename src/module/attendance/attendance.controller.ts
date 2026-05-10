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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IAttendanceQuery } from 'src/helpers/types/types';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@ApiTags('manual-attendance')
@Controller('manual-attendance')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Manual attendance (check-in / check-out)' })
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.attendanceService.create(
      createAttendanceDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  async findAll(
    @Query() query: IAttendanceQuery,
    @CompanyId() companyId: number,
  ) {
    const { attendance, pagination } =
      await this.attendanceService.findAll(query, companyId);
    return new ApiResponse(attendance, 200, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by id' })
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.attendanceService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.attendanceService.update(
      +id,
      updateAttendanceDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an attendance record' })
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.attendanceService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
