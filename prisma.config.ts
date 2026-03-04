import { defineConfig } from 'prisma/config';
import { env } from 'src/helpers/config/env.config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
