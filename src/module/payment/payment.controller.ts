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
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { WorkerRolesGuard } from 'src/helpers/guard/worker-role.guard';
import { AuthGuard } from 'src/helpers/guard/auth.guard';
import { WorkerRoles } from 'src/helpers/decorators/roles.decorator';
import { worker_role } from 'prisma/generated/prisma/enums';
import { ApiResponse } from 'src/helpers/responce/api-responce';
import { CompanyId } from 'src/helpers/decorators/company-id.decorator';
import { IPaymentQuery } from 'src/helpers/types/types';
import { PaymentExportQueryDto } from 'src/helpers/export/export-query.dto';

@Controller('payment')
@UseGuards(AuthGuard, WorkerRolesGuard)
@WorkerRoles(worker_role.maneger)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.paymentService.create(createPaymentDto, companyId);
    return new ApiResponse(data);
  }

  @Get()
  async findAll(@Query() query: IPaymentQuery, @CompanyId() companyId: number) {
    const { payment, pagination } = await this.paymentService.findAll(
      query,
      companyId,
    );
    return new ApiResponse(payment, 200, pagination);
  }

  @Get('excel/download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOperation({ summary: 'Download worker payments (oylik ish haqi) as Excel' })
  async downloadExcel(
    @Query() query: PaymentExportQueryDto,
    @CompanyId() companyId: number | null,
  ) {
    const { buffer, filename } = await this.paymentService.downloadExcel(
      query,
      companyId,
    );
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.paymentService.findOne(+id, companyId);
    return new ApiResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CompanyId() companyId: number,
  ) {
    const data = await this.paymentService.update(
      +id,
      updatePaymentDto,
      companyId,
    );
    return new ApiResponse(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CompanyId() companyId: number) {
    const data = await this.paymentService.remove(+id, companyId);
    return new ApiResponse(data);
  }
}
