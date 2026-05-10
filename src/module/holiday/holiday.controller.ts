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
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IHolidayQuery } from 'src/helpers/types/types';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@ApiTags('Holiday')
@Controller('api/v1/holiday')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @ApiOperation({ summary: 'Create a new holiday' })
  @Post()
  async create(
    @Body() createHolidayDto: CreateHolidayDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.holidayService.create(createHolidayDto, companyId);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Get all holidays' })
  @Get()
  async findAll(
    @Query() query: IHolidayQuery,
    @CompanyId() companyId: number,
  ) {
    const { holiday, pagination } = await this.holidayService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(holiday, 200, pagination);
  }

  @ApiOperation({ summary: 'Get holiday by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.holidayService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Update holiday' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.holidayService.update(+id, updateHolidayDto, companyId);
    return new ApiResponse(data);
  }

  @ApiOperation({ summary: 'Delete holiday' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.holidayService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
