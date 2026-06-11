import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  isBoardState,
  normalizeBoardState,
} from '../../src/board/validation.js';
import type { BoardRepository } from '../db/boardRepository.js';
import { readRequestBody, sendJson } from '../http/json.js';

export const handleBoardApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  repository: BoardRepository
) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (pathname !== '/api/board') {
    return false;
  }

  if (request.method === 'GET') {
    const payload = repository.readBoardPayload();
    const state = payload ? normalizeBoardState(JSON.parse(payload)) : null;

    sendJson(response, 200, {
      state: isBoardState(state) ? state : null,
    });
    return true;
  }

  if (request.method === 'PUT') {
    let body: unknown;

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

    repository.upsertBoardPayload(JSON.stringify(body), new Date().toISOString());
    sendJson(response, 200, { state: body });
    return true;
  }

  sendJson(response, 405, { error: 'Method not allowed.' });
  return true;
};
