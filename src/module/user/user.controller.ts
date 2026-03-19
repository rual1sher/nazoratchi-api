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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { IUserQuery } from 'src/helpers/types/types';
import { AdminGuard } from 'src/helpers/guard/admin.guard';

@Controller('user')
@UseGuards(AuthGuard, AdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: IUserQuery) {
    const { pagination, users } = await this.userService.findAll(query);
    return new ApiResponse(users, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(+id, updateUserDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.userService.remove(+id);
    return new ApiResponse(data);
  }
}
