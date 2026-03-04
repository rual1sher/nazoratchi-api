import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const company = await this.prisma.company.create({
      data: dto,
      include: { filial: true, worker: true },
    });

    return company;
  }

  async findAll() {
    return await this.prisma.company.findMany({
      where: { deleted_at: null },
      include: { _count: { select: { worker: true, filial: true } } },
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id, deleted_at: null },
      include: { filial: true, worker: true },
    });
    if (!company) throw new NotFoundException('Company not found');

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id, deleted_at: null },
    });
    if (!company) throw new NotFoundException('Company not found');

    return await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id, deleted_at: null },
    });
    if (!company) throw new NotFoundException('Company not found');

    return await this.prisma.company.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
