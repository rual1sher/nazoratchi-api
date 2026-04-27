import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { task_status } from 'prisma/generated/prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix bugs' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Fix all critical bugs in API' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 3, description: '1=low, 2=medium, 3=high' })
  @IsInt()
  priority: number;

  @ApiPropertyOptional({ enum: task_status, example: task_status.created })
  @IsEnum(task_status)
  @IsOptional()
  status?: task_status;

  @ApiProperty({ example: [1, 2, 3], description: 'Array of worker IDs' })
  @IsArray()
  @IsInt({ each: true })
  employee_ids: number[];
}
