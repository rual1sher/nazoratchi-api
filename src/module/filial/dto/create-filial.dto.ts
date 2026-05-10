import { IsInt, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** "lat,lng" with optional spaces (decimal degrees). */
export const FILIAL_COORDINATES_LAT_LNG =
  /^\s*[-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?\s*$/;

export class CreateFilialDto {
  @ApiProperty({ example: 'Markaziy filial' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Toshkent, Amir Temur 1' })
  @IsString()
  address: string;

  @ApiProperty({
    example: 100,
    description: 'Radius in meters',
  })
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  radius: number;

  @ApiProperty({
    example: '41.55, 60.63',
    description: 'Point as "latitude,longitude"',
  })
  @IsString()
  @Matches(FILIAL_COORDINATES_LAT_LNG, {
    message: 'coordinates must be "lat,lng" (e.g. 41.55,60.63)',
  })
  coordinates: string;
}
