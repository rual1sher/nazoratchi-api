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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import {
  IAttendanceDashboardQuery,
  IAttendanceQuery,
} from 'src/helpers/types/types';
@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create new attendance record' })
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    const data = await this.attendanceService.create(createAttendanceDto);
    return new ApiResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  async findAll(@Query() query: IAttendanceQuery) {
    const { attendance, pagination } =
      await this.attendanceService.findAll(query);
    return new ApiResponse(attendance, 200, pagination);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard attendance records' })
  async getDashboardAttendance(@Query() query: IAttendanceDashboardQuery) {
    const { attendance, pagination } =
      await this.attendanceService.getDashboardAttendance(query);
    return new ApiResponse(attendance, 200, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.attendanceService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const data = await this.attendanceService.update(+id, updateAttendanceDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an attendance record' })
  async remove(@Param('id') id: string) {
    const data = await this.attendanceService.remove(+id);
    return new ApiResponse(data);
  }
}
