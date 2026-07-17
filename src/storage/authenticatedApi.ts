import type {
  BoardActiveWorkCycle,
  BoardBackground,
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
