import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient as PostgresPrismaClient } from '../generated/prisma/postgres/client.js';
import { PrismaClient as SqlitePrismaClient } from '../generated/prisma/sqlite/client.js';
import type { ServerConfig } from '../config.js';

export type FlowboardPrismaClient = SqlitePrismaClient;

export const createFlowboardPrismaClient = (
  config: Pick<ServerConfig, 'databaseProvider' | 'databaseUrl'>
): FlowboardPrismaClient => {
  if (config.databaseProvider === 'postgresql') {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is required when PRISMA_PROVIDER=postgresql.');
    }

    return new PostgresPrismaClient({
      adapter: new PrismaPg({
        connectionString: config.databaseUrl,
      }),
    }) as unknown as FlowboardPrismaClient;
  }

  return new SqlitePrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: config.databaseUrl,
    }),
  });
};
