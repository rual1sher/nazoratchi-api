import { IsISO8601, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaceIdAttendanceDto {
  @ApiProperty({
    example: '2026-05-31T09:15:00.000Z',
    description: 'Scan time (ISO 8601)',
  })
  @IsISO8601()
  @IsNotEmpty()
  date: string;
}
