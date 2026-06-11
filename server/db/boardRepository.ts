import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

type BoardRow = {
  payload: string;
};

export type BoardRepository = {
  readBoardPayload: () => string | null;
  upsertBoardPayload: (payload: string, updatedAt: string) => void;
};

export const createBoardRepository = (databasePath: string): BoardRepository => {
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new DatabaseSync(databasePath, { timeout: 5000 });

  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS board_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    ) STRICT;
  `);

  const selectBoard = database.prepare(`
    SELECT payload
    FROM board_state
    WHERE id = 1
  `);
  const upsertBoard = database.prepare(`
    INSERT INTO board_state (id, payload, updated_at)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at
  `);

  return {
    readBoardPayload: () => {
      const row = selectBoard.get() as BoardRow | undefined;

      return row?.payload ?? null;
    },
    upsertBoardPayload: (payload, updatedAt) => {
      upsertBoard.run(payload, updatedAt);
    },
  };
};
