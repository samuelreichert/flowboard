import type { BoardState } from '../types';

const API_BASE_URL = import.meta.env.VITE_FLOWBOARD_API_URL?.trim() ?? '';

type AuthenticatedBoardResponse = {
  board: {
    id: string;
    title: string;
    updatedAt: string;
  };
  state: BoardState;
};

const createHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

const parseBoardResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error('Unable to load authenticated board data.');
  }

  return (await response.json()) as AuthenticatedBoardResponse;
};

export const fetchAuthenticatedDefaultBoard = async (accessToken: string) => {
  const response = await fetch(`${API_BASE_URL}/api/boards/default`, {
    headers: createHeaders(accessToken),
  });

  return parseBoardResponse(response);
};

export const saveAuthenticatedBoard = async (
  boardId: string,
  state: BoardState,
  accessToken: string
) => {
  const response = await fetch(`${API_BASE_URL}/api/boards/${boardId}`, {
    body: JSON.stringify(state),
    headers: createHeaders(accessToken),
    method: 'PUT',
  });

  return parseBoardResponse(response);
};
