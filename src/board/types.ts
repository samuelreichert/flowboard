export const CARD_PRIORITIES = ['low', 'medium', 'high'] as const;

export type CardPriority = (typeof CARD_PRIORITIES)[number];

export type BoardTag = {
  id: string;
  name: string;
};

export type BoardCard = {
  content: string;
  createdAt: string;
  id: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  cards: BoardCard[];
  position: number;
};

export type BoardBackground =
  | {
      type: 'color';
      value: string;
    }
  | {
      type: 'image';
      value: string;
    };

export type BoardState = {
  background: BoardBackground;
  columns: BoardColumn[];
  tags: BoardTag[];
};
