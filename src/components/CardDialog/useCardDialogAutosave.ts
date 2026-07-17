import { useRef } from 'react';
import type { Dispatch, MutableRefObject } from 'react';

import type {
  CardDialogAction,
  CardDialogSaveValues,
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
  onSave: (values: CardDialogSaveValues) => string | void;
  state: MutableRefObject<
    Pick<
      CardDialogState,
      'content' | 'priority' | 'selectedColumnId' | 'selectedTagIds' | 'title'
    >
  >;
  titleRequiredMessage: string;
}) => {
  const lastValidTitleRef = useRef(initialTitle);

  const saveExistingCard = (nextValues: SaveExistingCardInput) => {
    const currentState = state.current;
    const nextTitle = nextValues.title ?? currentState.title;
    const trimmedTitle = nextTitle.trim();
    const titleToSave = trimmedTitle || lastValidTitleRef.current;

    if (!trimmedTitle) {
      dispatch({
        type: 'fieldsChanged',
        values: { error: titleRequiredMessage },
      });

      if (nextValues.title !== undefined) {
        return;
      }
    } else {
      lastValidTitleRef.current = trimmedTitle;
      dispatch({ type: 'fieldsChanged', values: { error: '' } });
    }

    if (!titleToSave) {
      return;
    }

    const changedFields =
      nextValues.title === undefined
        ? nextValues
        : {
            ...nextValues,
            title: titleToSave,
          };
    const message = onSave({
      columnId: nextValues.columnId ?? currentState.selectedColumnId,
      content: nextValues.content ?? currentState.content,
      changedFields,
      priority: nextValues.priority ?? currentState.priority,
      tagIds: nextValues.tagIds ?? currentState.selectedTagIds,
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
