import type { CardPriority } from './cardPriority.ts';

export type { CardPriority } from './cardPriority.ts';

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

export type ArchivedCardTagSnapshot = {
  id: string;
  name: string;
};

export type ArchivedBoardCard = {
  archivedAt: string;
  content: string;
  createdAt: string;
  id: string;
  priority: CardPriority;
  tagIds: string[];
  tagSnapshots: ArchivedCardTagSnapshot[];
  title: string;
};

export type BoardActiveWorkCycle = {
  completedColumnId: string | null;
  startDate: string;
};

export type CompletedWorkCycle = {
  cards: ArchivedBoardCard[];
  completedColumnId: string | null;
  completedColumnTitle: string | null;
  endDate: string;
  id: string;
  startDate: string;
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
  activeWorkCycle: BoardActiveWorkCycle;
  background: BoardBackground;
  columns: BoardColumn[];
  completedWorkCycles: CompletedWorkCycle[];
  tags: BoardTag[];
};
