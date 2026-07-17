import type {
  BoardCard,
  BoardColumn,
  BoardTag,
  CardPriority,
} from '../../types';

export type CardDialogValues = {
  columnId: string;
  content: string;
  priority: CardPriority;
  tagIds: string[];
  title: string;
};

export type CardDialogSaveValues = CardDialogValues & {
  changedFields?: Partial<CardDialogValues>;
};

export type CardDialogProps = {
  card: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CardDialogSaveValues) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  open: boolean;
  tags: BoardTag[];
};

export type CardDialogState = {
  content: string;
  creatingTag: boolean;
  deleteOpen: boolean;
  error: string;
  newTagName: string;
  priority: CardPriority;
  selectedColumnId: string;
  selectedTagIds: string[];
  tagError: string;
  tagsOpen: boolean;
  title: string;
  titleEditing: boolean;
};

export type CardDialogAction =
  | { type: 'fieldsChanged'; values: Partial<CardDialogState> }
  | { type: 'tagCreated'; selectedTagIds: string[] }
  | { type: 'tagsClosed' };
