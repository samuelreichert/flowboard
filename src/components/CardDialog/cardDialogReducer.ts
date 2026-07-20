import type { BoardCard } from '../../types';
import type { CardDialogAction, CardDialogState } from './types';

export const createCardDialogState = (
  card: BoardCard,
  columnId: string
): CardDialogState => ({
  content: card.content,
  creatingTag: false,
  deleteOpen: false,
  error: '',
  newTagName: '',
  priority: card.priority,
  selectedColumnId: columnId,
  selectedTagIds: card.tagIds,
  tagError: '',
  tagsOpen: false,
  title: card.title,
  titleEditing: false,
});

export const cardDialogReducer = (
  state: CardDialogState,
  action: CardDialogAction
): CardDialogState => {
  switch (action.type) {
    case 'fieldsChanged':
      return { ...state, ...action.values };
    case 'tagCreated':
      return {
        ...state,
        creatingTag: false,
        newTagName: '',
        selectedTagIds: action.selectedTagIds,
        tagError: '',
        tagsOpen: false,
      };
    case 'tagsClosed':
      return {
        ...state,
        creatingTag: false,
        tagsOpen: false,
      };
  }
};
