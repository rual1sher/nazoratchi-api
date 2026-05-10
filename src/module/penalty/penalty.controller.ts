import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PenaltyService } from './penalty.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { UpdatePenaltyDto } from './dto/update-penalty.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { IPenaltyQuery } from 'src/helpers/types/types';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@Controller('penalty')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class PenaltyController {
  constructor(private penaltyService: PenaltyService) {}

  @Post()
  async create(
    @Body() createPenaltyDto: CreatePenaltyDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.penaltyService.create(createPenaltyDto, +companyId);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: IPenaltyQuery, @CompanyId() companyId: number) {
    const { penalty, pagination } = await this.penaltyService.findAll(
      query,
      +companyId,
    );
    return new ApiResponse(penalty, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.penaltyService.findOne(+id, +companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePenaltyDto: UpdatePenaltyDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.penaltyService.update(+id, updatePenaltyDto, +companyId);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.penaltyService.remove(+id, +companyId);
    return new ApiResponse(data);
  }
}
