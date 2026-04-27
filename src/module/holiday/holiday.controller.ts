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
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IHolidayQuery } from 'src/helpers/types/types';
@ApiTags('Holiday')
@Controller('api/v1/holiday')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @ApiOperation({ summary: 'Create a new holiday' })
  @Post()
  async create(@Body() createHolidayDto: CreateHolidayDto) {
    const data = await this.holidayService.create(createHolidayDto);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Get all holidays' })
  @Get()
  async findAll(@Query() query: IHolidayQuery) {
    const { holiday, pagination } = await this.holidayService.findAll(query);
    return new ApiResponse(holiday, 200, pagination);
  }

  @ApiOperation({ summary: 'Get holiday by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.holidayService.findOne(+id);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Update holiday' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
    const data = await this.holidayService.update(+id, updateHolidayDto);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Delete holiday' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.holidayService.remove(+id);
    return new ApiResponse(data);
  }
}
