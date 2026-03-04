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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { AdminGuard } from 'src/helpers/guard/role.guard';

@Controller('company')
@UseGuards(AuthGuard, AdminGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    const data = await this.companyService.create(createCompanyDto);
    return new ApiResponse(data);
  }

  @Get()
  async findAll() {
    const data = await this.companyService.findAll();
    return new ApiResponse(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.companyService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const data = await this.companyService.update(+id, updateCompanyDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.companyService.remove(+id);
    return new ApiResponse(data);
  }
}
