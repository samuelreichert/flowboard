export type BoardCard = {
  description: string;
  id: string;
  title: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  cards: BoardCard[];
  position: number;
};
