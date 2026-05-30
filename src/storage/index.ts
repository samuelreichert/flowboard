import type { BoardCard, BoardColumn } from '../types';

const STORAGE_KEY = 'columnsList';

const createId = () => crypto.randomUUID();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object';
};

const isBoardCard = (value: unknown): value is BoardCard => {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string'
  );
};

const isBoardColumn = (value: unknown): value is BoardColumn => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const column = value as BoardColumn;

  return (
    typeof column.id === 'string' &&
    typeof column.title === 'string' &&
    Array.isArray(column.cards) &&
    column.cards.every(isBoardCard) &&
    typeof column.position === 'number'
  );
};

const isLegacyColumn = (
  value: unknown
): value is { title: string; cards: string[]; position: number } => {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    Array.isArray(value.cards) &&
    value.cards.every((card) => typeof card === 'string') &&
    typeof value.position === 'number'
  );
};

export const updateStorage = (data: BoardColumn[]) => {
  const jsonData = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, jsonData);
};

export const fetchStorage = (): BoardColumn[] => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsedData: unknown = JSON.parse(data);

    if (Array.isArray(parsedData) && parsedData.every(isBoardColumn)) {
      return parsedData;
    }

    if (Array.isArray(parsedData) && parsedData.every(isLegacyColumn)) {
      const migratedColumns = parsedData.map((column) => ({
        ...column,
        id: createId(),
        cards: column.cards.map((title) => ({ id: createId(), title })),
      }));

      updateStorage(migratedColumns);
      return migratedColumns;
    }

    return [];
  } catch {
    return [];
  }
};
