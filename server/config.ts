import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = dirname(fileURLToPath(import.meta.url));

export type ServerConfig = {
  databasePath: string;
  databaseProvider: 'postgresql' | 'sqlite';
  databaseUrl: string;
  distDirectory: string;
  isDevelopment: boolean;
  port: number;
  rootDirectory: string;
  supabasePublishableKey: string | null;
  supabaseUrl: string | null;
};

export const createServerConfig = (): ServerConfig => {
  const rootDirectory = resolve(serverDirectory, '..', '..');
  const databasePath = resolve(
    process.env.FLOWBOARD_DB_PATH ?? join(rootDirectory, 'data', 'flowboard.db')
  );
  const databaseProvider =
    process.env.PRISMA_PROVIDER === 'postgresql' ? 'postgresql' : 'sqlite';
  const databaseUrl =
    process.env.DATABASE_URL ??
    (databaseProvider === 'sqlite'
      ? `file:${resolve(rootDirectory, 'data', 'flowboard.local.db')}`
      : '');

  return {
    databasePath,
    databaseProvider,
    databaseUrl,
    distDirectory: join(rootDirectory, 'dist'),
    isDevelopment: process.argv.includes('--dev'),
    port: Number(process.env.PORT ?? 5173),
    rootDirectory,
    supabasePublishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      null,
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? null,
  };
};
