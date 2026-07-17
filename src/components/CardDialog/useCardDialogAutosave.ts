import { useRef } from 'react';
import type { Dispatch } from 'react';

import type {
  CardDialogAction,
  CardDialogState,
  CardDialogValues,
} from './types';

type SaveExistingCardInput = Partial<Omit<CardDialogValues, 'title'>> & {
  title?: string;
};

export const useCardDialogAutosave = ({
  dispatch,
  initialTitle,
  onSave,
  state,
  titleRequiredMessage,
}: {
  dispatch: Dispatch<CardDialogAction>;
  initialTitle: string;
  onSave: (values: CardDialogValues) => string | void;
  state: Pick<
    CardDialogState,
    'content' | 'priority' | 'selectedColumnId' | 'selectedTagIds' | 'title'
  >;
  titleRequiredMessage: string;
}) => {
  const lastValidTitleRef = useRef(initialTitle);

  const saveExistingCard = (nextValues: SaveExistingCardInput) => {
    const nextTitle = nextValues.title ?? state.title;
    const trimmedTitle = nextTitle.trim();
    const titleToSave = trimmedTitle || lastValidTitleRef.current;

    if (!trimmedTitle) {
      dispatch({
        type: 'fieldsChanged',
        values: { error: titleRequiredMessage },
      });
    } else {
      lastValidTitleRef.current = trimmedTitle;
      dispatch({ type: 'fieldsChanged', values: { error: '' } });
    }

    if (!titleToSave) {
      return;
    }

    const message = onSave({
      columnId: nextValues.columnId ?? state.selectedColumnId,
      content: nextValues.content ?? state.content,
      priority: nextValues.priority ?? state.priority,
      tagIds: nextValues.tagIds ?? state.selectedTagIds,
      title: titleToSave,
    });

    if (message) {
      dispatch({ type: 'fieldsChanged', values: { error: message } });
    }
  };

  return {
    lastValidTitle: lastValidTitleRef.current,
    saveExistingCard,
  };
};
