import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = dirname(fileURLToPath(import.meta.url));

export type ServerConfig = {
  databasePath: string;
  distDirectory: string;
  isDevelopment: boolean;
  port: number;
  rootDirectory: string;
};

export const createServerConfig = (): ServerConfig => {
  const rootDirectory = resolve(serverDirectory, '..', '..');
  const databasePath = resolve(
    process.env.FLOWBOARD_DB_PATH ?? join(rootDirectory, 'data', 'flowboard.db')
  );

  return {
    databasePath,
    distDirectory: join(rootDirectory, 'dist'),
    isDevelopment: process.argv.includes('--dev'),
    port: Number(process.env.PORT ?? 5173),
    rootDirectory,
  };
};
