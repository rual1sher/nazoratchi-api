import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateFaceIdAttendanceDto } from './dto/create-face-id-attendance.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';

@ApiTags('face-id-attendance')
@Controller('face-id-attendance')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger, worker_role.worker)
export class FaceIdAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({
    summary: 'Face scan punch (check-in if no arrival, else check-out)',
  })
  async create(
    @Body() dto: CreateFaceIdAttendanceDto,
    @CompanyId() companyId: number,
    @WorkerId() workerId: number | null,
  ) {
    const data = await this.attendanceService.faceIdCreate(
      dto,
      companyId,
      workerId,
    );
    return new ApiResponse(data);
  }
}
