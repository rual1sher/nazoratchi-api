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
import { PenaltysNameService } from './penaltys-name.service';
import { CreatePenaltysNameDto } from './dto/create-penaltys-name.dto';
import { UpdatePenaltysNameDto } from './dto/update-penaltys-name.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { WorkerId } from 'src/helpers/decorators/worker-id.decorator';
import { IPenaltysNameQuery } from 'src/helpers/types/types';

@Controller('penaltys-name')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class PenaltysNameController {
  constructor(private readonly penaltysNameService: PenaltysNameService) {}

  @Post()
  async create(
    @Body() createPenaltysNameDto: CreatePenaltysNameDto,
    @WorkerId() workerId: string,
  ) {
    const data = await this.penaltysNameService.create(
      createPenaltysNameDto,
      +workerId,
    );
    return new ApiResponse(data);
  }

  @Get()
  async findAll(
    @Query() query: IPenaltysNameQuery,
    @WorkerId() workerId: string,
  ) {
    const { penaltysName, pagination } = await this.penaltysNameService.findAll(
      query,
      +workerId,
    );
    return new ApiResponse(penaltysName, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.penaltysNameService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePenaltysNameDto: UpdatePenaltysNameDto,
    @WorkerId() workerId: string,
  ) {
    const data = await this.penaltysNameService.update(
      +id,
      updatePenaltysNameDto,
      +workerId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.penaltysNameService.remove(+id);
    return new ApiResponse(data);
  }
}
