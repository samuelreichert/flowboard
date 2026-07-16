import type { BoardCard, BoardColumn, CardPriority } from './types.js';

type CardMove = {
  cardId: string;
  closestEdge: string | null;
  fromColumnId: string;
  targetCardId?: string;
  toColumnId: string;
};

type CreateColumnInput = {
  id: string;
  title: string;
};

type CreateCardInput = {
  columnId: string;
  content: string;
  createdAt: string;
  id: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

type EditCardInput = {
  columnId: string;
  content: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

export const createColumn = (
  columns: BoardColumn[],
  { id, title }: CreateColumnInput
): BoardColumn[] => [
  ...columns,
  { cards: [], id, position: columns.length * 10, title },
];

export const renameColumn = (
  columns: BoardColumn[],
  columnId: string,
  title: string
): BoardColumn[] =>
  columns.map((column) =>
    column.id === columnId ? { ...column, title } : column
  );

export const deleteColumn = (
  columns: BoardColumn[],
  columnId: string
): BoardColumn[] => columns.filter((column) => column.id !== columnId);

export const createCard = (
  columns: BoardColumn[],
  values: CreateCardInput
): BoardColumn[] =>
  columns.map((column) =>
    column.id === values.columnId
      ? {
          ...column,
          cards: [
            ...column.cards,
            {
              content: values.content,
              createdAt: values.createdAt,
              id: values.id,
              priority: values.priority,
              tagIds: values.tagIds,
              title: values.title,
            },
          ],
        }
      : column
  );

export const editCard = (
  columns: BoardColumn[],
  sourceColumnId: string,
  cardId: string,
  values: EditCardInput
): BoardColumn[] => {
  const sourceColumn = columns.find((column) => column.id === sourceColumnId);
  const existingCard = sourceColumn?.cards.find((card) => card.id === cardId);

  if (!sourceColumn || !existingCard) {
    return columns;
  }

  const updatedCard: BoardCard = {
    ...existingCard,
    content: values.content,
    priority: values.priority,
    tagIds: values.tagIds,
    title: values.title,
  };

  return columns.map((column) => {
    if (sourceColumnId === values.columnId && column.id === sourceColumnId) {
      return {
        ...column,
        cards: column.cards.map((card) =>
          card.id === cardId ? updatedCard : card
        ),
      };
    }

    if (column.id === sourceColumnId) {
      return {
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      };
    }

    if (column.id === values.columnId) {
      return {
        ...column,
        cards: [...column.cards, updatedCard],
      };
    }

    return column;
  });
};

export const deleteCard = (
  columns: BoardColumn[],
  columnId: string,
  cardId: string
): BoardColumn[] =>
  columns.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId),
        }
      : column
  );

export const clearBoard = (): BoardColumn[] => [];

export const reorderCard = (columns: BoardColumn[], move: CardMove) => {
  const sourceColumn = columns.find(
    (column) => column.id === move.fromColumnId
  );
  const card = sourceColumn?.cards.find((item) => item.id === move.cardId);

  if (!sourceColumn || !card) {
    return columns;
  }

  const destinationColumn = columns.find(
    (column) => column.id === move.toColumnId
  );

  if (!destinationColumn) {
    return columns;
  }

  const destinationCards = destinationColumn.cards.filter(
    (item) => item.id !== move.cardId
  );
  const targetIndex = move.targetCardId
    ? destinationCards.findIndex((item) => item.id === move.targetCardId)
    : destinationCards.length;

  if (targetIndex === -1) {
    return columns;
  }

  const insertAt =
    move.closestEdge === 'bottom' ? targetIndex + 1 : targetIndex;
  const reorderedCards = [...destinationCards];
  reorderedCards.splice(insertAt, 0, card);

  return columns.map((column) => {
    if (column.id === move.fromColumnId && column.id === move.toColumnId) {
      return { ...column, cards: reorderedCards };
    }

    if (column.id === move.fromColumnId) {
      return {
        ...column,
        cards: column.cards.filter((item) => item.id !== move.cardId),
      };
    }

    if (column.id === move.toColumnId) {
      return { ...column, cards: reorderedCards };
    }

    return column;
  });
};
