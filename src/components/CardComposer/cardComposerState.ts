import { DEFAULT_CARD_PRIORITY, type CardPriority } from '../../types';

export type CardComposerState = {
  creatingTag: boolean;
  draft: string;
  error: string;
  focused: boolean;
  newTagName: string;
  preferredColumnId: string;
  priority: CardPriority;
  selectedTagIds: string[];
  tagError: string;
  tagsOpen: boolean;
};

export type CardComposerAction =
  | { type: 'draftChanged'; draft: string }
  | { type: 'focusedChanged'; focused: boolean }
  | { type: 'priorityChanged'; priority: CardPriority }
  | { type: 'preferredColumnChanged'; columnId: string }
  | { type: 'selectedTagIdsChanged'; tagIds: string[] }
  | { type: 'tagsOpened' }
  | { type: 'tagsClosed' }
  | { type: 'tagCreateStarted' }
  | { type: 'newTagNameChanged'; name: string }
  | { type: 'tagErrorChanged'; error: string }
  | { type: 'tagCreated'; tagIds: string[] }
  | { type: 'submitFailed'; error: string }
  | { type: 'submitted' };

export const createCardComposerState = (
  preferredColumnId: string
): CardComposerState => ({
  creatingTag: false,
  draft: '',
  error: '',
  focused: false,
  newTagName: '',
  preferredColumnId,
  priority: DEFAULT_CARD_PRIORITY,
  selectedTagIds: [],
  tagError: '',
  tagsOpen: false,
});

export const cardComposerReducer = (
  state: CardComposerState,
  action: CardComposerAction
): CardComposerState => {
  switch (action.type) {
    case 'draftChanged':
      return { ...state, draft: action.draft, error: '' };
    case 'focusedChanged':
      return { ...state, focused: action.focused };
    case 'priorityChanged':
      return { ...state, priority: action.priority };
    case 'preferredColumnChanged':
      return { ...state, preferredColumnId: action.columnId };
    case 'selectedTagIdsChanged':
      return { ...state, selectedTagIds: action.tagIds };
    case 'tagsOpened':
      return { ...state, tagsOpen: true };
    case 'tagsClosed':
      return {
        ...state,
        creatingTag: false,
        newTagName: '',
        tagError: '',
        tagsOpen: false,
      };
    case 'tagCreateStarted':
      return { ...state, creatingTag: true, tagError: '' };
    case 'newTagNameChanged':
      return { ...state, newTagName: action.name, tagError: '' };
    case 'tagErrorChanged':
      return { ...state, tagError: action.error };
    case 'tagCreated':
      return {
        ...state,
        creatingTag: false,
        newTagName: '',
        selectedTagIds: action.tagIds,
        tagError: '',
        tagsOpen: false,
      };
    case 'submitFailed':
      return { ...state, error: action.error };
    case 'submitted':
      return {
        ...state,
        creatingTag: false,
        draft: '',
        error: '',
        newTagName: '',
        tagError: '',
        tagsOpen: false,
      };
  }
};
