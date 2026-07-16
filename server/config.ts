import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = dirname(fileURLToPath(import.meta.url));

export type ServerConfig = {
  databaseProvider: 'postgresql' | 'sqlite';
  databaseUrl: string;
  distDirectory: string;
  isDevelopment: boolean;
  localDevAuthEnabled: boolean;
  port: number;
  rootDirectory: string;
  supabasePublishableKey: string | null;
  supabaseUrl: string | null;
};

export const createServerConfig = (): ServerConfig => {
  const rootDirectory = resolve(serverDirectory, '..', '..');
  const databaseProvider =
    process.env.PRISMA_PROVIDER === 'postgresql' ? 'postgresql' : 'sqlite';
  const databaseUrl =
    process.env.DATABASE_URL ??
    (databaseProvider === 'sqlite'
      ? `file:${resolve(rootDirectory, 'data', 'flowboard.local.db')}`
      : '');
  const isDevelopment = process.argv.includes('--dev');
  const localDevAuthEnabled =
    databaseProvider === 'sqlite' &&
    (isDevelopment || process.env.FLOWBOARD_LOCAL_DEV_AUTH === 'true');

  return {
    databaseProvider,
    databaseUrl,
    distDirectory: join(rootDirectory, 'dist'),
    isDevelopment,
    localDevAuthEnabled,
    port: Number(process.env.PORT ?? 5173),
    rootDirectory,
    supabasePublishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      null,
    supabaseUrl:
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? null,
  };
};
