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
import { FilialService } from './filial.service';
import { CreateFilialDto } from './dto/create-filial.dto';
import { UpdateFilialDto } from './dto/update-filial.dto';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IFilialQuery } from 'src/helpers/types/types';

@Controller('filial')
export class FilialController {
  constructor(private readonly filialService: FilialService) {}

  @Post()
  async create(@Body() createFilialDto: CreateFilialDto) {
    const data = await this.filialService.create(createFilialDto);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: IFilialQuery) {
    const data = await this.filialService.findAll(query);
    return new ApiResponse(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.filialService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFilialDto: UpdateFilialDto,
  ) {
    const data = await this.filialService.update(+id, updateFilialDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.filialService.remove(+id);
    return new ApiResponse(data);
  }
}
