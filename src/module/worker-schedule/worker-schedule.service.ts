import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkerScheduleDto } from './dto/create-worker-schedule.dto';
import { UpdateWorkerScheduleDto } from './dto/update-worker-schedule.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { ErrorMessages } from 'src/helpers/error/error.message';

@Injectable()
export class WorkerScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkerScheduleDto) {
    if (dto?.day_id) {
      const day = await this.prisma.day.findUnique({
        where: { id: dto.day_id, deleted_at: null },
      });

      if (!day) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Day'),
        );
      }
    }

    return await this.prisma.worker_schedule.create({ data: dto });
  }

  findAll() {
    return `This action returns all workerSchedule`;
  }

  update(id: number, updateWorkerScheduleDto: UpdateWorkerScheduleDto) {
    return `This action updates a #${id} workerSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} workerSchedule`;
  }
}
