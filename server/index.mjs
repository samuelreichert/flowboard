import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = resolve(
  process.env.FLOWBOARD_DB_PATH ?? join(rootDirectory, 'data', 'flowboard.db')
);
const port = Number(process.env.PORT ?? 5173);
const isDevelopment = process.argv.includes('--dev');

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

const isRecord = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const CARD_CONTENT_LIMIT = 100_000;
const CARD_PRIORITIES = new Set(['low', 'medium', 'high']);
const DEFAULT_CARD_PRIORITY = 'medium';
const isValidDateString = (value) =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));
const isCardPriority = (value) =>
  typeof value === 'string' && CARD_PRIORITIES.has(value);

const isSafeImageUrl = (value) => {
  if (value.length > 2048) {
    return false;
  }

  if (value.startsWith('/') && !value.startsWith('//')) {
    return true;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const isBoardCard = (value) =>
  isRecord(value) &&
  typeof value.content === 'string' &&
  value.content.length <= CARD_CONTENT_LIMIT &&
  isValidDateString(value.createdAt) &&
  typeof value.id === 'string' &&
  value.id.length > 0 &&
  value.id.length <= 100 &&
  isCardPriority(value.priority) &&
  Array.isArray(value.tagIds) &&
  value.tagIds.length <= 50 &&
  value.tagIds.every((tagId) => typeof tagId === 'string') &&
  typeof value.title === 'string' &&
  value.title.trim().length > 0 &&
  value.title.length <= 120;

const isBoardTag = (value) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  value.id.length > 0 &&
  value.id.length <= 100 &&
  typeof value.name === 'string' &&
  value.name.trim().length > 0 &&
  value.name.length <= 60;

const isBoardColumn = (value) =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  value.id.length > 0 &&
  value.id.length <= 100 &&
  typeof value.title === 'string' &&
  value.title.trim().length > 0 &&
  value.title.length <= 80 &&
  Array.isArray(value.cards) &&
  value.cards.length <= 500 &&
  value.cards.every(isBoardCard) &&
  typeof value.position === 'number' &&
  Number.isFinite(value.position);

const isBoardBackground = (value) =>
  isRecord(value) &&
  typeof value.value === 'string' &&
  ((value.type === 'color' && /^#[0-9a-f]{6}$/i.test(value.value)) ||
    (value.type === 'image' && isSafeImageUrl(value.value)));

const isBoardState = (value) =>
  isRecord(value) &&
  Array.isArray(value.columns) &&
  value.columns.length <= 50 &&
  value.columns.every(isBoardColumn) &&
  isBoardBackground(value.background) &&
  Array.isArray(value.tags) &&
  value.tags.length <= 200 &&
  value.tags.every(isBoardTag);

const normalizeCardMetadata = (card) => ({
  ...card,
  priority: isCardPriority(card.priority)
    ? card.priority
    : DEFAULT_CARD_PRIORITY,
  tagIds: Array.isArray(card.tagIds)
    ? card.tagIds.filter((tagId) => typeof tagId === 'string')
    : [],
});

const normalizeCard = (card, migratedCreatedAt) => {
  if (!isRecord(card)) {
    return card;
  }

  if (typeof card.content === 'string') {
    return normalizeCardMetadata({
      ...card,
      createdAt: isValidDateString(card.createdAt)
        ? card.createdAt
        : migratedCreatedAt,
    });
  }

  if (typeof card.description === 'string') {
    return normalizeCardMetadata({
      content: card.description,
      createdAt: isValidDateString(card.createdAt)
        ? card.createdAt
        : migratedCreatedAt,
      id: card.id,
      priority: card.priority,
      tagIds: card.tagIds,
      title: card.title,
    });
  }

  return normalizeCardMetadata({
    ...card,
    content: '',
    createdAt: isValidDateString(card.createdAt)
      ? card.createdAt
      : migratedCreatedAt,
  });
};

const normalizeBoardState = (value) => {
  if (!isRecord(value) || !Array.isArray(value.columns)) {
    return value;
  }

  const migratedCreatedAt = new Date().toISOString();

  return {
    ...value,
    columns: value.columns.map((column) =>
      isRecord(column) && Array.isArray(column.cards)
        ? {
            ...column,
            cards: column.cards.map((card) =>
              normalizeCard(card, migratedCreatedAt)
            ),
          }
        : column
    ),
    tags: Array.isArray(value.tags) ? value.tags.filter(isBoardTag) : [],
  };
};

const readRequestBody = async (request) => {
  let body = '';

  for await (const chunk of request) {
    body += chunk;

    if (body.length > 1_000_000) {
      throw new Error('Request body is too large.');
    }
  }

  return body;
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
};

const handleApiRequest = async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (pathname !== '/api/board') {
    return false;
  }

  if (request.method === 'GET') {
    const row = selectBoard.get();
    const state = row ? normalizeBoardState(JSON.parse(row.payload)) : null;

    sendJson(response, 200, {
      state: isBoardState(state) ? state : null,
    });
    return true;
  }

  if (request.method === 'PUT') {
    let body;

    try {
      body = JSON.parse(await readRequestBody(request));
    } catch {
      sendJson(response, 400, { error: 'Invalid JSON payload.' });
      return true;
    }

    body = normalizeBoardState(body);

    if (!isBoardState(body)) {
      sendJson(response, 400, { error: 'Invalid board state.' });
      return true;
    }

    upsertBoard.run(JSON.stringify(body), new Date().toISOString());
    sendJson(response, 200, { state: body });
    return true;
  }

  sendJson(response, 405, { error: 'Method not allowed.' });
  return true;
};

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const serveProductionFile = (request, response) => {
  const distDirectory = join(rootDirectory, 'dist');
  const requestedPath = normalize(
    decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
  );
  const relativePath =
    requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '');
  const candidatePath = join(distDirectory, relativePath);
  const filePath =
    candidatePath.startsWith(`${distDirectory}/`) &&
    existsSync(candidatePath) &&
    statSync(candidatePath).isFile()
      ? candidatePath
      : join(distDirectory, 'index.html');

  response.writeHead(200, {
    'Content-Type':
      contentTypes[extname(filePath)] ?? 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
};

const vite = isDevelopment
  ? await import('vite').then(({ createServer: createViteServer }) =>
      createViteServer({
        appType: 'spa',
        server: { middlewareMode: true },
      })
    )
  : null;

const server = createServer(async (request, response) => {
  try {
    if (await handleApiRequest(request, response)) {
      return;
    }

    if (vite) {
      vite.middlewares(request, response);
      return;
    }

    serveProductionFile(request, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Internal server error.' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Flowboard running at http://127.0.0.1:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});
