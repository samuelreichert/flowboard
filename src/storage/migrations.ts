import type { BoardColumn } from '../types';
import { DEFAULT_CARD_PRIORITY } from '../board/constants';
import {
  isBoardColumn,
  isColumnWithLegacyDescriptions,
  isColumnWithoutDescriptions,
  isLegacyColumn,
  isValidDateString,
  normalizeCardMetadata,
} from '../board/validation';

type StoredColumnsNormalization = {
  columns: BoardColumn[];
  migrated: boolean;
} | null;

export const normalizeStoredColumns = (
  parsedData: unknown,
  migratedCreatedAt: string,
  createId: () => string
): StoredColumnsNormalization => {
  if (Array.isArray(parsedData) && parsedData.every(isBoardColumn)) {
    return { columns: parsedData, migrated: false };
  }

  if (
    Array.isArray(parsedData) &&
    parsedData.every(isColumnWithLegacyDescriptions)
  ) {
    return {
      columns: parsedData.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          'content' in card
            ? normalizeCardMetadata({
                ...card,
                createdAt: isValidDateString(card.createdAt)
                  ? card.createdAt
                  : migratedCreatedAt,
              })
            : normalizeCardMetadata({
                content: card.description,
                createdAt: isValidDateString(card.createdAt)
                  ? card.createdAt
                  : migratedCreatedAt,
                id: card.id,
                priority: card.priority,
                tagIds: card.tagIds,
                title: card.title,
              })
        ),
      })),
      migrated: true,
    };
  }

  if (
    Array.isArray(parsedData) &&
    parsedData.every(isColumnWithoutDescriptions)
  ) {
    return {
      columns: parsedData.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          normalizeCardMetadata({
            ...card,
            content: '',
            createdAt: isValidDateString(card.createdAt)
              ? card.createdAt
              : migratedCreatedAt,
          })
        ),
      })),
      migrated: true,
    };
  }

  if (Array.isArray(parsedData) && parsedData.every(isLegacyColumn)) {
    return {
      columns: parsedData.map((column) => ({
        ...column,
        id: createId(),
        cards: column.cards.map((title) => ({
          content: '',
          createdAt: migratedCreatedAt,
          id: createId(),
          priority: DEFAULT_CARD_PRIORITY,
          tagIds: [],
          title,
        })),
      })),
      migrated: true,
    };
  }

  return null;
};
