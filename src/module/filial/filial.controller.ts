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
import { FilialService } from './filial.service';
import { CreateFilialDto } from './dto/create-filial.dto';
import { UpdateFilialDto } from './dto/update-filial.dto';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IFilialQuery } from 'src/helpers/types/types';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@Controller('filial')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class FilialController {
  constructor(private readonly filialService: FilialService) {}

  @Post()
  async create(
    @Body() createFilialDto: CreateFilialDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.filialService.create(createFilialDto, companyId);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(
    @Query() query: IFilialQuery,
    @CompanyId() companyId: number,
  ) {
    const { filial, pagination } = await this.filialService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(filial, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.filialService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFilialDto: UpdateFilialDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.filialService.update(
      +id,
      updateFilialDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.filialService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
