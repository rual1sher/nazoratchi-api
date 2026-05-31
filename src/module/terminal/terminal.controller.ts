import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TerminalService } from './terminal.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';

@Controller('terminal')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Post()
  async create(
    @Body() createTerminalDto: CreateTerminalDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.terminalService.create(
      createTerminalDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@CompanyId() companyId: number) {
    const data = await this.terminalService.findAll(companyId);
    return new ApiResponse(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.terminalService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTerminalDto: UpdateTerminalDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.terminalService.update(
      +id,
      updateTerminalDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.terminalService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
