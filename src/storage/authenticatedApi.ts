import type {
  ArchivedBoardCard,
  BoardActiveWorkCycle,
  BoardBackground,
  CompletedWorkCycle,
  BoardState,
  BoardTag,
  CardPriority,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_FLOWBOARD_API_URL?.trim() ?? '';

type AuthenticatedBoardResponse = {
  board: {
    id: string;
    title: string;
    updatedAt: string;
  };
  state: BoardState;
};

export type AuthenticatedProfile = {
  avatarStoragePath: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  id: string;
};

type AuthenticatedProfileResponse = {
  profile: AuthenticatedProfile;
};

export type AuthenticatedProfileUpdate = {
  avatarStoragePath?: string | null;
  avatarUrl?: string | null;
  displayName?: string | null;
};

export type BoardBootstrapResponse = {
  board: {
    background: BoardBackground;
    id: string;
    title: string;
    version: number;
  };
  cards: Array<{
    columnId: string;
    id: string;
    priority: CardPriority;
    tagIds: string[];
    title: string;
  }>;
  columns: Array<{
    id: string;
    title: string;
  }>;
  tags: BoardTag[];
  workCycle: BoardActiveWorkCycle;
};

export type ActiveCardDetailResponse = {
  content: string;
  createdAt: string;
  id: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

export type CardMutationCard = ActiveCardDetailResponse & {
  columnId: string;
};

export type CardMutationResponse = {
  boardVersion: number;
  card: CardMutationCard;
};

export type DeleteCardMutationResponse = {
  boardVersion: number;
  cardId: string;
  columnId: string;
};

export type CreateCardMutationInput = {
  columnId: string;
  content: string;
  id: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

export type UpdateCardMutationInput = {
  content?: string;
  priority?: CardPriority;
  tagIds?: string[];
  title?: string;
};

export type MoveCardMutationInput = {
  afterCardId?: string | null;
  beforeCardId?: string | null;
  columnId: string;
};

export type ColumnMutationColumn = BoardBootstrapResponse['columns'][number];

export type ColumnMutationResponse = {
  boardVersion: number;
  column: ColumnMutationColumn;
  columns: ColumnMutationColumn[];
};

export type DeleteColumnMutationResponse = {
  boardVersion: number;
  cardIds: string[];
  columnId: string;
  columns: ColumnMutationColumn[];
  workCycle: BoardActiveWorkCycle;
};

export type CreateColumnMutationInput = {
  id: string;
  title: string;
};

export type UpdateColumnMutationInput = {
  title: string;
};

export type MoveColumnMutationInput = {
  afterColumnId?: string | null;
  beforeColumnId?: string | null;
};

export type TagMutationResponse = {
  boardVersion: number;
  tag: BoardTag;
  tags: BoardTag[];
};

export type DeleteTagMutationResponse = {
  affectedCardIds: string[];
  boardVersion: number;
  tagId: string;
  tags: BoardTag[];
};

export type CreateTagMutationInput = {
  id: string;
  name: string;
};

export type UpdateTagMutationInput = {
  name: string;
};

export type CardTagMutationResponse = {
  boardVersion: number;
  card: BoardBootstrapResponse['cards'][number];
};

export type BoardSettingsMutationInput = {
  background: BoardBackground;
};

export type BoardSettingsMutationResponse = {
  board: {
    background: BoardBackground;
    version: number;
  };
};

export type WorkCycleSettingsMutationInput = {
  completedColumnId: string | null;
};

export type WorkCycleSettingsMutationResponse = {
  boardVersion: number;
  workCycle: BoardActiveWorkCycle;
};

export type CompletedHistoryCardSummary = Omit<ArchivedBoardCard, 'content'> & {
  hasContent: boolean;
};

export type CompletedHistoryCycleSummary = Omit<CompletedWorkCycle, 'cards'> & {
  cards: CompletedHistoryCardSummary[];
};

export type CompletedHistoryResponse = {
  cycles: CompletedHistoryCycleSummary[];
  pageInfo: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type CompleteWorkCycleMutationResponse = {
  boardVersion: number;
  cardIds: string[];
  columnId: string;
  cycle: CompletedHistoryCycleSummary;
  workCycle: BoardActiveWorkCycle;
};

export type ArchivedCardDetailResponse = ArchivedBoardCard;

export type ClearBoardMutationResponse = {
  boardVersion: number;
  cardIds: string[];
  columns: BoardBootstrapResponse['columns'];
  workCycle: BoardActiveWorkCycle;
};

const createHeaders = (accessToken?: string) => ({
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  'Content-Type': 'application/json',
});

const parseBoardResponse = async (
  response: Response,
  message = 'Unable to load board data.'
) => {
  if (!response.ok) {
    throw new Error(message);
  }

  return (await response.json()) as AuthenticatedBoardResponse;
};

const parseProfileResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to load authenticated profile data.');
  }

  return (await response.json()) as AuthenticatedProfileResponse;
};

const parseBoardBootstrapResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to load board bootstrap data.');
  }

  return (await response.json()) as BoardBootstrapResponse;
};

const parseActiveCardDetailResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to load card detail data.');
  }

  return (await response.json()) as ActiveCardDetailResponse;
};

const parseCardMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to save card data.');
  }

  return (await response.json()) as CardMutationResponse;
};

const parseDeleteCardMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to delete card data.');
  }

  return (await response.json()) as DeleteCardMutationResponse;
};

const parseColumnMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to save column data.');
  }

  return (await response.json()) as ColumnMutationResponse;
};

const parseDeleteColumnMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to delete column data.');
  }

  return (await response.json()) as DeleteColumnMutationResponse;
};

const parseTagMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to save tag data.');
  }

  return (await response.json()) as TagMutationResponse;
};

const parseDeleteTagMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to delete tag data.');
  }

  return (await response.json()) as DeleteTagMutationResponse;
};

const parseCardTagMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to save card tag data.');
  }

  return (await response.json()) as CardTagMutationResponse;
};

const parseBoardSettingsMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to save board settings.');
  }

  return (await response.json()) as BoardSettingsMutationResponse;
};

const parseWorkCycleSettingsMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to save work-cycle settings.');
  }

  return (await response.json()) as WorkCycleSettingsMutationResponse;
};

const parseCompleteWorkCycleMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to complete work cycle.');
  }

  return (await response.json()) as CompleteWorkCycleMutationResponse;
};

const parseClearBoardMutationResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to clear board.');
  }

  return (await response.json()) as ClearBoardMutationResponse;
};

const parseCompletedHistoryResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to load completed work history.');
  }

  return (await response.json()) as CompletedHistoryResponse;
};

const parseArchivedCardDetailResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to load archived card detail.');
  }

  return (await response.json()) as ArchivedCardDetailResponse;
};

export const fetchAuthenticatedProfile = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    headers: createHeaders(accessToken),
  });

  return parseProfileResponse(response);
};

export const saveAuthenticatedProfile = async (
  profile: AuthenticatedProfileUpdate,
  accessToken: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    body: JSON.stringify(profile),
    headers: createHeaders(accessToken),
    method: 'PUT',
  });

  return parseProfileResponse(response);
};

export const fetchBoardBootstrap = async (accessToken?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/board/bootstrap`, {
    headers: createHeaders(accessToken),
  });

  return parseBoardBootstrapResponse(response);
};

export const fetchActiveCardDetail = async (
  cardId: string,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/cards/${encodeURIComponent(cardId)}`,
    {
      headers: createHeaders(accessToken),
    }
  );

  return parseActiveCardDetailResponse(response);
};

export const createActiveCard = async (
  card: CreateCardMutationInput,
  accessToken?: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/board/cards`, {
    body: JSON.stringify(card),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return parseCardMutationResponse(response);
};

export const updateActiveCard = async (
  cardId: string,
  card: UpdateCardMutationInput,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/cards/${encodeURIComponent(cardId)}`,
    {
      body: JSON.stringify(card),
      headers: createHeaders(accessToken),
      method: 'PATCH',
    }
  );

  return parseCardMutationResponse(response);
};

export const moveActiveCard = async (
  cardId: string,
  placement: MoveCardMutationInput,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/cards/${encodeURIComponent(cardId)}/move`,
    {
      body: JSON.stringify(placement),
      headers: createHeaders(accessToken),
      method: 'PATCH',
    }
  );

  return parseCardMutationResponse(response);
};

export const deleteActiveCard = async (
  cardId: string,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/cards/${encodeURIComponent(cardId)}`,
    {
      headers: createHeaders(accessToken),
      method: 'DELETE',
    }
  );

  return parseDeleteCardMutationResponse(response);
};

export const createActiveColumn = async (
  column: CreateColumnMutationInput,
  accessToken?: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/board/columns`, {
    body: JSON.stringify(column),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return parseColumnMutationResponse(response);
};

export const updateActiveColumn = async (
  columnId: string,
  column: UpdateColumnMutationInput,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/columns/${encodeURIComponent(columnId)}`,
    {
      body: JSON.stringify(column),
      headers: createHeaders(accessToken),
      method: 'PATCH',
    }
  );

  return parseColumnMutationResponse(response);
};

export const moveActiveColumn = async (
  columnId: string,
  placement: MoveColumnMutationInput,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/columns/${encodeURIComponent(columnId)}/move`,
    {
      body: JSON.stringify(placement),
      headers: createHeaders(accessToken),
      method: 'PATCH',
    }
  );

  return parseColumnMutationResponse(response);
};

export const deleteActiveColumn = async (
  columnId: string,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/columns/${encodeURIComponent(columnId)}`,
    {
      headers: createHeaders(accessToken),
      method: 'DELETE',
    }
  );

  return parseDeleteColumnMutationResponse(response);
};

export const createBoardTag = async (
  tag: CreateTagMutationInput,
  accessToken?: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/board/tags`, {
    body: JSON.stringify(tag),
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return parseTagMutationResponse(response);
};

export const updateBoardTag = async (
  tagId: string,
  tag: UpdateTagMutationInput,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/tags/${encodeURIComponent(tagId)}`,
    {
      body: JSON.stringify(tag),
      headers: createHeaders(accessToken),
      method: 'PATCH',
    }
  );

  return parseTagMutationResponse(response);
};

export const deleteBoardTag = async (tagId: string, accessToken?: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/tags/${encodeURIComponent(tagId)}`,
    {
      headers: createHeaders(accessToken),
      method: 'DELETE',
    }
  );

  return parseDeleteTagMutationResponse(response);
};

export const assignActiveCardTag = async (
  cardId: string,
  tagId: string,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/cards/${encodeURIComponent(cardId)}/tags/${encodeURIComponent(tagId)}`,
    {
      headers: createHeaders(accessToken),
      method: 'PUT',
    }
  );

  return parseCardTagMutationResponse(response);
};

export const unassignActiveCardTag = async (
  cardId: string,
  tagId: string,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/cards/${encodeURIComponent(cardId)}/tags/${encodeURIComponent(tagId)}`,
    {
      headers: createHeaders(accessToken),
      method: 'DELETE',
    }
  );

  return parseCardTagMutationResponse(response);
};

export const updateBoardSettings = async (
  settings: BoardSettingsMutationInput,
  accessToken?: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/board/settings`, {
    body: JSON.stringify(settings),
    headers: createHeaders(accessToken),
    method: 'PATCH',
  });

  return parseBoardSettingsMutationResponse(response);
};

export const updateWorkCycleSettings = async (
  settings: WorkCycleSettingsMutationInput,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/work-cycle/settings`,
    {
      body: JSON.stringify(settings),
      headers: createHeaders(accessToken),
      method: 'PATCH',
    }
  );

  return parseWorkCycleSettingsMutationResponse(response);
};

export const completeWorkCycle = async (accessToken?: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/work-cycle/complete`,
    {
      headers: createHeaders(accessToken),
      method: 'POST',
    }
  );

  return parseCompleteWorkCycleMutationResponse(response);
};

export const clearBoard = async (accessToken?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/board/clear`, {
    headers: createHeaders(accessToken),
    method: 'POST',
  });

  return parseClearBoardMutationResponse(response);
};

export const fetchCompletedHistory = async ({
  accessToken,
  cursor,
  limit,
}: {
  accessToken?: string;
  cursor?: string | null;
  limit?: number;
} = {}) => {
  const searchParams = new URLSearchParams();

  if (limit !== undefined) {
    searchParams.set('limit', String(limit));
  }

  if (cursor) {
    searchParams.set('cursor', cursor);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/board/work-cycles/history${queryString ? `?${queryString}` : ''}`,
    {
      headers: createHeaders(accessToken),
    }
  );

  return parseCompletedHistoryResponse(response);
};

export const fetchArchivedCardDetail = async (
  cycleId: string,
  cardId: string,
  accessToken?: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/api/board/work-cycles/${encodeURIComponent(cycleId)}/cards/${encodeURIComponent(cardId)}`,
    {
      headers: createHeaders(accessToken),
    }
  );

  return parseArchivedCardDetailResponse(response);
};

export const fetchDefaultBoard = async (accessToken?: string) => {
  const response = await fetch(`${API_BASE_URL}/api/boards/default`, {
    headers: createHeaders(accessToken),
  });

  return parseBoardResponse(response, 'Unable to load board data.');
};

export const saveBoard = async (
  boardId: string,
  state: BoardState,
  accessToken?: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}`, {
    body: JSON.stringify(state),
    headers: createHeaders(accessToken),
    method: 'PUT',
  });

  return parseBoardResponse(response, 'Unable to save board data.');
};

export const fetchAuthenticatedDefaultBoard = (accessToken: string) =>
  fetchDefaultBoard(accessToken);

export const saveAuthenticatedBoard = (
  boardId: string,
  state: BoardState,
  accessToken: string
) => saveBoard(boardId, state, accessToken);
