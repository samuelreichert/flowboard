import type { BoardCard } from '../../types';
import { DEFAULT_CARD_PRIORITY } from './constants';
import type { CardDialogAction, CardDialogState } from './types';

export const createCardDialogState = (
  card: BoardCard | undefined,
  columnId: string
): CardDialogState => ({
  content: card?.content ?? '',
  creatingTag: false,
  deleteOpen: false,
  discardOpen: false,
  error: '',
  newTagName: '',
  priority: card?.priority ?? DEFAULT_CARD_PRIORITY,
  selectedColumnId: columnId,
  selectedTagIds: card?.tagIds ?? [],
  tagError: '',
  tagsOpen: false,
  title: card?.title ?? '',
  titleEditing: !card,
});

export const cardDialogReducer = (
  state: CardDialogState,
  action: CardDialogAction
): CardDialogState => {
  switch (action.type) {
    case 'closed':
      return {
        ...state,
        creatingTag: false,
        deleteOpen: false,
        discardOpen: false,
        newTagName: '',
        tagError: '',
        tagsOpen: false,
      };
    case 'fieldsChanged':
      return { ...state, ...action.values };
    case 'opened':
      return action.state;
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
        newTagName: '',
        tagError: '',
        tagsOpen: false,
      };
  }
};
