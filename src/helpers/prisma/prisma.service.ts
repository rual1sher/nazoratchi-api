import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { env } from 'src/helpers/config/env.config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: env.databaseUrl,
    });
    super({ adapter });
  }
}
