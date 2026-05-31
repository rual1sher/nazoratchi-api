import { PartialType } from '@nestjs/swagger';
import { CreateFaceIdAttendanceDto } from './create-face-id-attendance.dto';

export class UpdateFaceIdAttendanceDto extends PartialType(
  CreateFaceIdAttendanceDto,
) {}
