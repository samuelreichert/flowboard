import { defineConfig, env } from 'prisma/config';

const provider = process.env.PRISMA_PROVIDER === 'postgresql' ? 'postgresql' : 'sqlite';
const isPostgres = provider === 'postgresql';

export default defineConfig({
  schema: isPostgres ? 'prisma/schema.prisma' : 'prisma/schema.sqlite.prisma',
  datasource: {
    url: isPostgres
      ? env('DATABASE_URL')
      : (process.env.DATABASE_URL ?? 'file:./data/flowboard.local.db'),
  },
  migrations: {
    path: isPostgres ? 'prisma/migrations/postgresql' : 'prisma/migrations/sqlite',
  },
});
