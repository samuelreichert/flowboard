import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient as PostgresPrismaClient } from '../generated/prisma/postgres/client.js';
import { PrismaClient as SqlitePrismaClient } from '../generated/prisma/sqlite/client.js';
import type { ServerConfig } from '../config.js';

type FlowboardPrismaTransactionOptions = {
  maxWait?: number;
  timeout?: number;
};

type PrismaDelegate<Model extends object, Method extends keyof Model> = Pick<
  Model,
  Method
>;

type FlowboardPrismaDelegates = {
  board: PrismaDelegate<
    SqlitePrismaClient['board'],
    'create' | 'findFirst' | 'update'
  >;
  boardColumn: PrismaDelegate<
    SqlitePrismaClient['boardColumn'],
    | 'create'
    | 'createMany'
    | 'delete'
    | 'deleteMany'
    | 'findFirst'
    | 'findMany'
    | 'update'
  >;
  boardWorkCycle: PrismaDelegate<
    SqlitePrismaClient['boardWorkCycle'],
    | 'create'
    | 'deleteMany'
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'update'
    | 'upsert'
  >;
  card: PrismaDelegate<
    SqlitePrismaClient['card'],
    | 'create'
    | 'createMany'
    | 'delete'
    | 'deleteMany'
    | 'findFirst'
    | 'findMany'
    | 'update'
  >;
  cardTag: PrismaDelegate<
    SqlitePrismaClient['cardTag'],
    | 'create'
    | 'createMany'
    | 'delete'
    | 'deleteMany'
    | 'findMany'
    | 'findUnique'
  >;
  completedWorkCycle: PrismaDelegate<
    SqlitePrismaClient['completedWorkCycle'],
    'create' | 'createMany' | 'deleteMany' | 'findMany'
  >;
  completedWorkCycleCard: PrismaDelegate<
    SqlitePrismaClient['completedWorkCycleCard'],
    'createMany' | 'deleteMany' | 'findFirst'
  >;
  completedWorkCycleCardTag: PrismaDelegate<
    SqlitePrismaClient['completedWorkCycleCardTag'],
    'createMany' | 'deleteMany'
  >;
  profile: PrismaDelegate<
    SqlitePrismaClient['profile'],
    'create' | 'findUnique' | 'findUniqueOrThrow' | 'update'
  >;
  project: PrismaDelegate<
    SqlitePrismaClient['project'],
    'create' | 'findFirst' | 'findMany'
  >;
  tag: PrismaDelegate<
    SqlitePrismaClient['tag'],
    | 'create'
    | 'createMany'
    | 'delete'
    | 'deleteMany'
    | 'findFirst'
    | 'findMany'
    | 'update'
  >;
};

export type FlowboardPrismaTransactionClient = FlowboardPrismaDelegates;

export type FlowboardPrismaClient = FlowboardPrismaDelegates & {
  $transaction<Result>(
    callback: (
      transaction: FlowboardPrismaTransactionClient
    ) => Promise<Result>,
    options?: FlowboardPrismaTransactionOptions
  ): Promise<Result>;
};

export const createFlowboardPrismaClient = (
  config: Pick<ServerConfig, 'databaseProvider' | 'databaseUrl'>
): FlowboardPrismaClient => {
  if (config.databaseProvider === 'postgresql') {
    if (!config.databaseUrl) {
      throw new Error(
        'DATABASE_URL is required when PRISMA_PROVIDER=postgresql.'
      );
    }

    return new PostgresPrismaClient({
      adapter: new PrismaPg({
        connectionString: config.databaseUrl,
      }),
    });
  }

  return new SqlitePrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: config.databaseUrl,
    }),
  });
};
