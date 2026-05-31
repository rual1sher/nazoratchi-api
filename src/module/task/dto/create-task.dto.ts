import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export class CreateTaskDto {
  @ApiProperty({ example: 'Fix bugs' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Fix all critical bugs in API' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'Worker IDs assigned to task',
  })
  @IsArray()
  @IsInt({ each: true })
  workers_ids: number[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  col: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  row?: number;

  @ApiPropertyOptional({ example: 'https://example.com/file.pdf' })
  @IsString()
  @IsOptional()
  file?: string;

  @ApiProperty({ enum: TASK_PRIORITIES, example: 'low' })
  @IsEnum(TASK_PRIORITIES)
  priority: TaskPriority;
}
