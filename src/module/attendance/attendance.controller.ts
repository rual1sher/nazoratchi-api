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
  StreamableFile,
  Header,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import {
  IAttendanceDashboardQuery,
  IAttendanceQuery,
  IAttendanceReportQuery,
  IAttendanceChartQuery,
} from 'src/helpers/types/types';
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
    const { attendance, pagination } = await this.attendanceService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(attendance, 200, pagination);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard attendance records' })
  async getDashboardAttendance(
    @Query() query: IAttendanceDashboardQuery,
    @CompanyId() companyId: number,
  ) {
    const data = await this.attendanceService.getDashboardAttendance(
      query,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Get('report')
  @ApiOperation({ summary: 'Attendance report (on_time / late)' })
  async report(
    @Query() query: IAttendanceReportQuery,
    @CompanyId() companyId: number,
  ) {
    const data = await this.attendanceService.report(query, companyId);
    return new ApiResponse(data);
  }

  @Get('chart')
  @ApiOperation({ summary: 'Attendance chart (daily on_time / late / not_work)' })
  async chart(
    @Query() query: IAttendanceChartQuery,
    @CompanyId() companyId: number,
  ) {
    const data = await this.attendanceService.chart(query, companyId);
    return new ApiResponse(data);
  }

  @Get('chart/excel/download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({ summary: 'Download attendance chart as Excel' })
  async downloadChartExcel(
    @Query() query: IAttendanceChartQuery,
    @CompanyId() companyId: number,
  ) {
    const { buffer, filename } =
      await this.attendanceService.downloadChartExcel(query, companyId);
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${filename}"`,
    });
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
