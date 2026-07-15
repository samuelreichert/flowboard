import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { createServerConfig } from './config.js';

const originalArgv = [...process.argv];

beforeEach(() => {
  process.argv = [...originalArgv];
});

afterEach(() => {
  process.argv = [...originalArgv];
  vi.unstubAllEnvs();
});

describe('createServerConfig', () => {
  test('enables local development auth for SQLite dev runs', () => {
    vi.stubEnv('PRISMA_PROVIDER', 'sqlite');
    process.argv = [...originalArgv, '--dev'];

    expect(createServerConfig().localDevAuthEnabled).toBe(true);
  });

  test('allows local development auth for built SQLite runs with an explicit flag', () => {
    vi.stubEnv('PRISMA_PROVIDER', 'sqlite');
    vi.stubEnv('FLOWBOARD_LOCAL_DEV_AUTH', 'true');

    expect(createServerConfig().localDevAuthEnabled).toBe(true);
  });

  test('never enables local development auth for Postgres runs', () => {
    vi.stubEnv('PRISMA_PROVIDER', 'postgresql');
    vi.stubEnv('FLOWBOARD_LOCAL_DEV_AUTH', 'true');
    process.argv = [...originalArgv, '--dev'];

    expect(createServerConfig().localDevAuthEnabled).toBe(false);
  });
});
