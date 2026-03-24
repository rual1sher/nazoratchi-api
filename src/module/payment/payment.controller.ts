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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { ApiResponse } from 'src/helpers/responce/api-responce';

@Controller('payment')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const data = await this.paymentService.create(createPaymentDto);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: any) {
    const { payment, pagination } = await this.paymentService.findAll(query);
    return new ApiResponse(payment, 200, pagination);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.paymentService.findOne(+id);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    const data = await this.paymentService.update(+id, updatePaymentDto);
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.paymentService.remove(+id);
    return new ApiResponse(data);
  }
}
