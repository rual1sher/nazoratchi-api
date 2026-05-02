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
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';
import { IPositionQuery } from 'src/helpers/types/types';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@Controller('position')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  async create(@Body() createPositionDto: CreatePositionDto) {
    const data = await this.positionService.create(createPositionDto);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(
    @Query() query: IPositionQuery,
    @CompanyId() companyId: number,
  ) {
    const { position, pagination } = await this.positionService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(position, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.positionService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    const data = await this.positionService.update(+id, updatePositionDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.positionService.remove(+id);
    return new ApiResponse(data);
  }
}
