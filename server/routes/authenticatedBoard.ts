import type { IncomingMessage, ServerResponse } from 'node:http';

import { isBoardBackground } from '../../src/board/validation.js';
import { CARD_PRIORITIES } from '../../src/board/cardPriority.js';
import { ensureProfile } from '../auth/profileService.js';
import type { PrincipalResolver } from '../auth/principal.js';
import type { FlowboardPrismaClient } from '../db/prismaClient.js';
import {
  assignActiveCardTag,
  clearActiveBoard,
  completeActiveWorkCycle,
  COMPLETED_HISTORY_DEFAULT_LIMIT,
  COMPLETED_HISTORY_MAX_LIMIT,
  createActiveColumn,
  createActiveCard,
  createBoardTag,
  decodeCompletedHistoryCursor,
  deleteActiveColumn,
  deleteActiveCard,
  deleteBoardTag,
  listProjects,
  loadActiveCardDetail,
  loadArchivedCardDetail,
  loadCompletedHistoryPage,
  loadMainBoardBootstrap,
  moveActiveColumn,
  moveActiveCard,
  renameActiveColumn,
  renameBoardTag,
  unassignActiveCardTag,
  updateActiveCard,
  updateBoardSettings,
  updateWorkCycleSettings,
  type ActiveCardCreateInput,
  type ActiveCardMoveInput,
  type ActiveCardUpdateInput,
  type ActiveColumnCreateInput,
  type ActiveColumnMoveInput,
  type ActiveColumnUpdateInput,
  type BoardSettingsUpdateInput,
  type BoardTagCreateInput,
  type BoardTagUpdateInput,
  type WorkCycleSettingsUpdateInput,
} from '../db/structuredBoardRepository.js';
import {
  sendBadRequest,
  sendNotFound,
  sendUnauthenticated,
} from '../http/apiErrors.js';
import { readRequestBody, sendJson } from '../http/json.js';

const ACTIVE_CARD_COLLECTION_PATH = '/api/board/cards';
const ACTIVE_CARD_MOVE_PATH_PATTERN = /^\/api\/board\/cards\/([^/]+)\/move$/;
const ACTIVE_CARD_TAG_PATH_PATTERN =
  /^\/api\/board\/cards\/([^/]+)\/tags\/([^/]+)$/;
const ACTIVE_CARD_DETAIL_PATH_PATTERN = /^\/api\/board\/cards\/([^/]+)$/;
const ACTIVE_COLUMN_COLLECTION_PATH = '/api/board/columns';
const ACTIVE_COLUMN_MOVE_PATH_PATTERN =
  /^\/api\/board\/columns\/([^/]+)\/move$/;
const ACTIVE_COLUMN_DETAIL_PATH_PATTERN = /^\/api\/board\/columns\/([^/]+)$/;
const BOARD_TAG_COLLECTION_PATH = '/api/board/tags';
const BOARD_TAG_DETAIL_PATH_PATTERN = /^\/api\/board\/tags\/([^/]+)$/;
const BOARD_SETTINGS_PATH = '/api/board/settings';
const CLEAR_BOARD_PATH = '/api/board/clear';
const WORK_CYCLE_SETTINGS_PATH = '/api/board/work-cycle/settings';
const WORK_CYCLE_COMPLETE_PATH = '/api/board/work-cycle/complete';
const COMPLETED_HISTORY_PATH = '/api/board/work-cycles/history';
const ARCHIVED_CARD_DETAIL_PATH_PATTERN =
  /^\/api\/board\/work-cycles\/([^/]+)\/cards\/([^/]+)$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim().length > 0;

const isCardPriority = (
  value: unknown
): value is ActiveCardCreateInput['priority'] =>
  isString(value) &&
  CARD_PRIORITIES.includes(value as ActiveCardCreateInput['priority']);

const normalizeTagIds = (value: unknown) => {
  if (!Array.isArray(value) || value.some((item) => !isString(item))) {
    return null;
  }

  return [...new Set(value)];
};

const readJsonPayload = async (request: IncomingMessage) => {
  try {
    return JSON.parse(await readRequestBody(request)) as unknown;
  } catch {
    return null;
  }
};

const normalizeCardFields = (body: unknown) => {
  if (!isRecord(body)) {
    return null;
  }

  const tagIds = normalizeTagIds(body.tagIds);

  if (
    !isNonEmptyString(body.title) ||
    !isString(body.content) ||
    !isCardPriority(body.priority) ||
    !tagIds
  ) {
    return null;
  }

  return {
    content: body.content,
    priority: body.priority,
    tagIds,
    title: body.title.trim(),
  };
};

const normalizeCreateCardInput = (
  body: unknown
): ActiveCardCreateInput | null => {
  const fields = normalizeCardFields(body);

  if (
    !fields ||
    !isRecord(body) ||
    !isNonEmptyString(body.columnId) ||
    !isNonEmptyString(body.id)
  ) {
    return null;
  }

  return {
    ...fields,
    columnId: body.columnId,
    id: body.id,
  };
};

const normalizeUpdateCardInput = (
  body: unknown
): ActiveCardUpdateInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const input: ActiveCardUpdateInput = {};

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      return null;
    }

    input.title = body.title.trim();
  }

  if (body.content !== undefined) {
    if (!isString(body.content)) {
      return null;
    }

    input.content = body.content;
  }

  if (body.priority !== undefined) {
    if (!isCardPriority(body.priority)) {
      return null;
    }

    input.priority = body.priority;
  }

  if (body.tagIds !== undefined) {
    const tagIds = normalizeTagIds(body.tagIds);

    if (!tagIds) {
      return null;
    }

    input.tagIds = tagIds;
  }

  return Object.keys(input).length > 0 ? input : null;
};

const normalizeNullableString = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  return isNonEmptyString(value) ? value : undefined;
};

const normalizeMoveCardInput = (body: unknown): ActiveCardMoveInput | null => {
  if (!isRecord(body) || !isNonEmptyString(body.columnId)) {
    return null;
  }

  const beforeCardId = normalizeNullableString(body.beforeCardId);
  const afterCardId = normalizeNullableString(body.afterCardId);

  if (beforeCardId === undefined || afterCardId === undefined) {
    return null;
  }

  if (beforeCardId && afterCardId) {
    return null;
  }

  return {
    afterCardId,
    beforeCardId,
    columnId: body.columnId,
  };
};

const normalizeCreateColumnInput = (
  body: unknown
): ActiveColumnCreateInput | null => {
  if (
    !isRecord(body) ||
    !isNonEmptyString(body.id) ||
    !isNonEmptyString(body.title)
  ) {
    return null;
  }

  return {
    id: body.id,
    title: body.title.trim(),
  };
};

const normalizeUpdateColumnInput = (
  body: unknown
): ActiveColumnUpdateInput | null => {
  if (!isRecord(body) || !isNonEmptyString(body.title)) {
    return null;
  }

  return { title: body.title.trim() };
};

const normalizeMoveColumnInput = (
  body: unknown
): ActiveColumnMoveInput | null => {
  if (!isRecord(body)) {
    return null;
  }

  const beforeColumnId = normalizeNullableString(body.beforeColumnId);
  const afterColumnId = normalizeNullableString(body.afterColumnId);

  if (beforeColumnId === undefined || afterColumnId === undefined) {
    return null;
  }

  if (beforeColumnId && afterColumnId) {
    return null;
  }

  return {
    afterColumnId,
    beforeColumnId,
  };
};

const normalizeCreateTagInput = (body: unknown): BoardTagCreateInput | null => {
  if (
    !isRecord(body) ||
    !isNonEmptyString(body.id) ||
    !isNonEmptyString(body.name)
  ) {
    return null;
  }

  return {
    id: body.id,
    name: body.name.trim(),
  };
};

const normalizeUpdateTagInput = (body: unknown): BoardTagUpdateInput | null => {
  if (!isRecord(body) || !isNonEmptyString(body.name)) {
    return null;
  }

  return { name: body.name.trim() };
};

const normalizeBoardSettingsInput = (
  body: unknown
): BoardSettingsUpdateInput | null => {
  if (!isRecord(body) || !isBoardBackground(body.background)) {
    return null;
  }

  return { background: body.background };
};

const normalizeWorkCycleSettingsInput = (
  body: unknown
): WorkCycleSettingsUpdateInput | null => {
  if (!isRecord(body) || !('completedColumnId' in body)) {
    return null;
  }

  const completedColumnId = normalizeNullableString(body.completedColumnId);

  if (completedColumnId === undefined) {
    return null;
  }

  return { completedColumnId };
};

const normalizeCompletedHistoryQuery = (url: URL) => {
  const limitValue = url.searchParams.get('limit');
  const cursor = url.searchParams.get('cursor');
  const limit =
    limitValue === null ? COMPLETED_HISTORY_DEFAULT_LIMIT : Number(limitValue);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > COMPLETED_HISTORY_MAX_LIMIT
  ) {
    return null;
  }

  if (cursor !== null && !decodeCompletedHistoryCursor(cursor)) {
    return null;
  }

  return {
    cursor,
    limit,
  };
};

const decodePathId = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const handleAuthenticatedBoardApiRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  prisma: FlowboardPrismaClient,
  principalResolver: PrincipalResolver
) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const pathname = url.pathname;

  if (
    pathname !== '/api/board/bootstrap' &&
    pathname !== ACTIVE_CARD_COLLECTION_PATH &&
    pathname !== ACTIVE_COLUMN_COLLECTION_PATH &&
    pathname !== BOARD_TAG_COLLECTION_PATH &&
    pathname !== BOARD_SETTINGS_PATH &&
    pathname !== CLEAR_BOARD_PATH &&
    pathname !== WORK_CYCLE_SETTINGS_PATH &&
    pathname !== WORK_CYCLE_COMPLETE_PATH &&
    pathname !== COMPLETED_HISTORY_PATH &&
    pathname !== '/api/projects' &&
    !ACTIVE_CARD_MOVE_PATH_PATTERN.test(pathname) &&
    !ACTIVE_CARD_TAG_PATH_PATTERN.test(pathname) &&
    !ACTIVE_CARD_DETAIL_PATH_PATTERN.test(pathname) &&
    !ACTIVE_COLUMN_MOVE_PATH_PATTERN.test(pathname) &&
    !ACTIVE_COLUMN_DETAIL_PATH_PATTERN.test(pathname) &&
    !ARCHIVED_CARD_DETAIL_PATH_PATTERN.test(pathname) &&
    !BOARD_TAG_DETAIL_PATH_PATTERN.test(pathname)
  ) {
    return false;
  }

  const user = await principalResolver.resolveRequest(request);

  if (!user) {
    sendUnauthenticated(response);
    return true;
  }

  await ensureProfile(prisma, user);

  if (pathname === '/api/board/bootstrap') {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    sendJson(response, 200, await loadMainBoardBootstrap(prisma, user.id));
    return true;
  }

  if (pathname === CLEAR_BOARD_PATH) {
    if (request.method !== 'POST') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    sendJson(response, 200, await clearActiveBoard(prisma, user.id));
    return true;
  }

  if (pathname === WORK_CYCLE_COMPLETE_PATH) {
    if (request.method !== 'POST') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const result = await completeActiveWorkCycle(prisma, user.id);

    if (!result) {
      sendBadRequest(response, 'Unable to complete work cycle.');
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  if (pathname === COMPLETED_HISTORY_PATH) {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeCompletedHistoryQuery(url);

    if (!input) {
      sendBadRequest(response, 'Invalid history pagination.');
      return true;
    }

    const result = await loadCompletedHistoryPage(prisma, user.id, input);

    if (!result) {
      sendBadRequest(response, 'Invalid history pagination.');
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  const archivedCardDetailMatch = pathname.match(
    ARCHIVED_CARD_DETAIL_PATH_PATTERN
  );

  if (archivedCardDetailMatch) {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const cycleId = decodePathId(archivedCardDetailMatch[1]);
    const cardId = decodePathId(archivedCardDetailMatch[2]);

    if (!isNonEmptyString(cycleId) || !isNonEmptyString(cardId)) {
      sendBadRequest(response, 'Invalid archived card route.');
      return true;
    }

    const card = await loadArchivedCardDetail(prisma, user.id, cycleId, cardId);

    if (!card) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, card);
    return true;
  }

  if (pathname === ACTIVE_CARD_COLLECTION_PATH) {
    if (request.method !== 'POST') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeCreateCardInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid card payload.');
      return true;
    }

    const result = await createActiveCard(prisma, user.id, input);

    if (!result) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 201, result);
    return true;
  }

  if (pathname === ACTIVE_COLUMN_COLLECTION_PATH) {
    if (request.method !== 'POST') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeCreateColumnInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid column payload.');
      return true;
    }

    const result = await createActiveColumn(prisma, user.id, input);

    if (!result) {
      sendBadRequest(response, 'Invalid column payload.');
      return true;
    }

    sendJson(response, 201, result);
    return true;
  }

  const activeColumnMoveId = pathname.match(
    ACTIVE_COLUMN_MOVE_PATH_PATTERN
  )?.[1];

  if (activeColumnMoveId) {
    if (request.method !== 'PATCH') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeMoveColumnInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid column move payload.');
      return true;
    }

    const result = await moveActiveColumn(
      prisma,
      user.id,
      decodePathId(activeColumnMoveId),
      input
    );

    if (!result) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  const activeColumnId = pathname.match(ACTIVE_COLUMN_DETAIL_PATH_PATTERN)?.[1];

  if (activeColumnId) {
    const decodedColumnId = decodePathId(activeColumnId);

    if (request.method === 'PATCH') {
      const input = normalizeUpdateColumnInput(await readJsonPayload(request));

      if (!input) {
        sendBadRequest(response, 'Invalid column payload.');
        return true;
      }

      const result = await renameActiveColumn(
        prisma,
        user.id,
        decodedColumnId,
        input
      );

      if (!result) {
        sendBadRequest(response, 'Invalid column payload.');
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    if (request.method === 'DELETE') {
      const result = await deleteActiveColumn(prisma, user.id, decodedColumnId);

      if (!result) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    sendBadRequest(response, 'Unsupported board API method.');
    return true;
  }

  if (pathname === BOARD_TAG_COLLECTION_PATH) {
    if (request.method !== 'POST') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeCreateTagInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid tag payload.');
      return true;
    }

    const result = await createBoardTag(prisma, user.id, input);

    if (!result) {
      sendBadRequest(response, 'Invalid tag payload.');
      return true;
    }

    sendJson(response, 201, result);
    return true;
  }

  const boardTagId = pathname.match(BOARD_TAG_DETAIL_PATH_PATTERN)?.[1];

  if (boardTagId) {
    const decodedTagId = decodePathId(boardTagId);

    if (request.method === 'PATCH') {
      const input = normalizeUpdateTagInput(await readJsonPayload(request));

      if (!input) {
        sendBadRequest(response, 'Invalid tag payload.');
        return true;
      }

      const result = await renameBoardTag(prisma, user.id, decodedTagId, input);

      if (!result) {
        sendBadRequest(response, 'Invalid tag payload.');
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    if (request.method === 'DELETE') {
      const result = await deleteBoardTag(prisma, user.id, decodedTagId);

      if (!result) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    sendBadRequest(response, 'Unsupported board API method.');
    return true;
  }

  const activeCardTagMatch = pathname.match(ACTIVE_CARD_TAG_PATH_PATTERN);

  if (activeCardTagMatch) {
    const decodedCardId = decodePathId(activeCardTagMatch[1]);
    const decodedTagId = decodePathId(activeCardTagMatch[2]);
    const result =
      request.method === 'PUT'
        ? await assignActiveCardTag(
            prisma,
            user.id,
            decodedCardId,
            decodedTagId
          )
        : request.method === 'DELETE'
          ? await unassignActiveCardTag(
              prisma,
              user.id,
              decodedCardId,
              decodedTagId
            )
          : null;

    if (!result) {
      if (request.method !== 'PUT' && request.method !== 'DELETE') {
        sendBadRequest(response, 'Unsupported board API method.');
      } else {
        sendNotFound(response);
      }

      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  if (pathname === BOARD_SETTINGS_PATH) {
    if (request.method !== 'PATCH') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeBoardSettingsInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid board settings payload.');
      return true;
    }

    sendJson(response, 200, await updateBoardSettings(prisma, user.id, input));
    return true;
  }

  if (pathname === WORK_CYCLE_SETTINGS_PATH) {
    if (request.method !== 'PATCH') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeWorkCycleSettingsInput(
      await readJsonPayload(request)
    );

    if (!input) {
      sendBadRequest(response, 'Invalid work-cycle settings payload.');
      return true;
    }

    const result = await updateWorkCycleSettings(prisma, user.id, input);

    if (!result) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  const activeCardMoveId = pathname.match(ACTIVE_CARD_MOVE_PATH_PATTERN)?.[1];

  if (activeCardMoveId) {
    if (request.method !== 'PATCH') {
      sendBadRequest(response, 'Unsupported board API method.');
      return true;
    }

    const input = normalizeMoveCardInput(await readJsonPayload(request));

    if (!input) {
      sendBadRequest(response, 'Invalid card move payload.');
      return true;
    }

    const result = await moveActiveCard(
      prisma,
      user.id,
      decodePathId(activeCardMoveId),
      input
    );

    if (!result) {
      sendNotFound(response);
      return true;
    }

    sendJson(response, 200, result);
    return true;
  }

  const activeCardId = pathname.match(ACTIVE_CARD_DETAIL_PATH_PATTERN)?.[1];

  if (activeCardId) {
    const decodedCardId = decodePathId(activeCardId);

    if (request.method === 'GET') {
      const card = await loadActiveCardDetail(prisma, user.id, decodedCardId);

      if (!card) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, card);
      return true;
    }

    if (request.method === 'PATCH') {
      const input = normalizeUpdateCardInput(await readJsonPayload(request));

      if (!input) {
        sendBadRequest(response, 'Invalid card payload.');
        return true;
      }

      const result = await updateActiveCard(
        prisma,
        user.id,
        decodedCardId,
        input
      );

      if (!result) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    if (request.method === 'DELETE') {
      const result = await deleteActiveCard(prisma, user.id, decodedCardId);

      if (!result) {
        sendNotFound(response);
        return true;
      }

      sendJson(response, 200, result);
      return true;
    }

    sendBadRequest(response, 'Unsupported board API method.');
    return true;
  }

  if (pathname === '/api/projects') {
    if (request.method !== 'GET') {
      sendBadRequest(response, 'Unsupported project API method.');
      return true;
    }

    sendJson(response, 200, {
      projects: await listProjects(prisma, user.id),
    });
    return true;
  }

  return false;
};
