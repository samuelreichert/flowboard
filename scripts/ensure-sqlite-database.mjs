import { open, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';

const DEFAULT_DATABASE_URL = 'file:./data/flowboard.local.db';

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

if (!databaseUrl.startsWith('file:')) {
  throw new Error('DATABASE_URL must use a SQLite file: URL.');
}

const databaseLocation = decodeURIComponent(
  databaseUrl.slice('file:'.length).split(/[?#]/, 1)[0]
);

if (!databaseLocation || databaseLocation === ':memory:') {
  process.exit(0);
}

const databasePath = isAbsolute(databaseLocation)
  ? databaseLocation
  : resolve(process.cwd(), databaseLocation);

await mkdir(dirname(databasePath), { recursive: true });
const databaseFile = await open(databasePath, 'a');
await databaseFile.close();
