import type { BoardColumn } from '../types';

const STORAGE_KEY = 'columnsList';

const isBoardColumn = (value: unknown): value is BoardColumn => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const column = value as BoardColumn;

  return (
    typeof column.title === 'string' &&
    Array.isArray(column.cards) &&
    column.cards.every((card) => typeof card === 'string') &&
    typeof column.position === 'number'
  );
};

export const updateStorage = (data: BoardColumn[]) => {
  const jsonData = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, jsonData);
};

export const fetchStorage = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const parsedData: unknown = JSON.parse(data);
    return Array.isArray(parsedData) && parsedData.every(isBoardColumn)
      ? parsedData
      : [];
  } catch {
    return [];
  }
};
