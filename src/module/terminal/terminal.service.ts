import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { Prisma } from 'prisma/generated/prisma/client';
import { ErrorMessages } from 'src/helpers/error/error.message';
import { requireCompanyId } from 'src/helpers/company/require-company-id';

export type TerminalListItem = {
  id: number;
  name: string;
  unique_id: string;
  mac_address: string;
  branch: string;
};

type TerminalWithBranch = Prisma.terminalGetPayload<{
  include: { branch: true };
}>;

@Injectable()
export class TerminalService {
  constructor(private prisma: PrismaService) {}

  private serialize(row: TerminalWithBranch): TerminalListItem {
    return {
      id: row.id,
      name: row.name,
      unique_id: row.unique_id,
      mac_address: row.mac_address,
      branch: row.branch.name,
    };
  }

  private async assertFilialForCompany(
    filialId: number,
    companyId: number,
  ): Promise<void> {
    const branch = await this.prisma.filial.findFirst({
      where: { id: filialId, company_id: companyId, deleted_at: null },
    });
    if (!branch) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Filial'),
      );
    }
  }

  async create(dto: CreateTerminalDto, companyId: number | null) {
    const cId = requireCompanyId(companyId);
    await this.assertFilialForCompany(dto.filial_id, cId);

    try {
      const created = await this.prisma.terminal.create({
        data: {
          name: dto.name.trim(),
          unique_id: dto.unique_id.trim(),
          mac_address: dto.mac_address.trim(),
          branch_id: dto.filial_id,
          company_id: cId,
        },
        include: { branch: true },
      });
      return this.serialize(created);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          ErrorMessages.conflict.alreadyExists('Terminal'),
        );
      }
      throw e;
    }
  }

  async findAll(companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const rows = await this.prisma.terminal.findMany({
      where: { company_id: cId, deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: { branch: true },
    });

    return rows.map((r) => this.serialize(r));
  }

  async findOne(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const row = await this.prisma.terminal.findFirst({
      where: { id, company_id: cId, deleted_at: null },
      include: { branch: true },
    });

    if (!row) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Terminal'),
      );
    }

    return this.serialize(row);
  }

  async update(
    id: number,
    dto: UpdateTerminalDto,
    companyId: number | null,
  ) {
    const cId = requireCompanyId(companyId);

    const existing = await this.prisma.terminal.findFirst({
      where: { id, company_id: cId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Terminal'),
      );
    }

    if (dto.filial_id !== undefined) {
      await this.assertFilialForCompany(dto.filial_id, cId);
    }

    const data: Prisma.terminalUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.unique_id !== undefined) data.unique_id = dto.unique_id.trim();
    if (dto.mac_address !== undefined) data.mac_address = dto.mac_address.trim();
    if (dto.filial_id !== undefined) data.branch_id = dto.filial_id;

    if (Object.keys(data).length === 0) {
      const row = await this.prisma.terminal.findFirst({
        where: { id, company_id: cId },
        include: { branch: true },
      });
      if (!row) {
        throw new NotFoundException(
          ErrorMessages.notFound.modelNotFound('Terminal'),
        );
      }
      return this.serialize(row);
    }

    try {
      const updated = await this.prisma.terminal.update({
        where: { id },
        data,
        include: { branch: true },
      });
      return this.serialize(updated);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          ErrorMessages.conflict.alreadyExists('Terminal'),
        );
      }
      throw e;
    }
  }

  async remove(id: number, companyId: number | null) {
    const cId = requireCompanyId(companyId);

    const existing = await this.prisma.terminal.findFirst({
      where: { id, company_id: cId, deleted_at: null },
    });

    if (!existing) {
      throw new NotFoundException(
        ErrorMessages.notFound.modelNotFound('Terminal'),
      );
    }

    const updated = await this.prisma.terminal.update({
      where: { id },
      data: { deleted_at: new Date() },
      include: { branch: true },
    });

    return this.serialize(updated);
  }
}
