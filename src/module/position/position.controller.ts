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
import { Owner } from 'src/helpers/decorators/owner.decorator';
import { IPayload, IPositionQuery } from 'src/helpers/types/types';

@Controller('position')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @WorkerId() workerId: string,
    @Owner() { role }: IPayload,
  ) {
    const data = await this.positionService.create(
      createPositionDto,
      +workerId,
      role,
    );
    return new ApiResponse(data);
  }

  @Get()
  async findAll(
    @Query() query: IPositionQuery,
    @WorkerId() workerId: string,
    @Owner() { role }: IPayload,
  ) {
    const { position, pagination } = await this.positionService.findAll(
      query,
      +workerId,
      role,
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
    @WorkerId() workerId: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @Owner() { role }: IPayload,
  ) {
    const data = await this.positionService.update(
      +id,
      updatePositionDto,
      +workerId,
      role,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @WorkerId() workerId: string) {
    const data = await this.positionService.remove(+id, +workerId);
    return new ApiResponse(data);
  }
}
