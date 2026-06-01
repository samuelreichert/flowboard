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
};
