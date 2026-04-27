import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { ISalaryQuery } from 'src/helpers/types/types';
@ApiTags('Salary')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @ApiOperation({ summary: 'Create new salary record' })
  async create(@Body() createSalaryDto: CreateSalaryDto) {
    const data = await this.salaryService.create(createSalaryDto);
    return new ApiResponse(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary records' })
  async findAll(@Query() query: ISalaryQuery) {
    const { salary, pagination } = await this.salaryService.findAll(query);
    return new ApiResponse(salary, 200, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a salary record by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.salaryService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a salary record' })
  async update(@Param('id') id: string, @Body() updateSalaryDto: UpdateSalaryDto) {
    const data = await this.salaryService.update(+id, updateSalaryDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a salary record' })
  async remove(@Param('id') id: string) {
    const data = await this.salaryService.remove(+id);
    return new ApiResponse(data);
  }
}
