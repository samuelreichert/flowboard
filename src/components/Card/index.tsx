import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { AlignLeft } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';
import type { MouseEvent } from 'react';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useNavigate } from 'react-router';

import CardMetadata from '../CardMetadata';
import CardDialog from '../CardDialog';
import type { CardDialogValues } from '../CardDialog';
import { useLocalization } from '../../LocalizationProvider';
import { isCardDragData } from '../../dnd';
import { createActiveCardPath } from '../../app/routes';
import type { BoardCard, BoardColumn, BoardTag } from '../../types';

import './Card.css';

type CardProps = {
  activeCardId: string | null;
  card: BoardCard;
  columnId: string;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogValues
  ) => string | void;
  onTagsChange: (tags: BoardTag[]) => void;
  onActiveCardClose: () => void;
  tags: BoardTag[];
};

const hasSelectionInside = (element: HTMLElement) => {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.isCollapsed ||
    selection.toString().trim().length === 0
  ) {
    return false;
  }

  return Boolean(
    (selection.anchorNode && element.contains(selection.anchorNode)) ||
    (selection.focusNode && element.contains(selection.focusNode))
  );
};

type CardState = {
  closestEdge: Edge | null;
  detailsOpen: boolean;
  isDragging: boolean;
};

type CardAction =
  | { type: 'closestEdgeChanged'; closestEdge: Edge | null }
  | { type: 'detailsOpenChanged'; open: boolean }
  | { type: 'draggingChanged'; isDragging: boolean };

const cardReducer = (state: CardState, action: CardAction): CardState => {
  switch (action.type) {
    case 'closestEdgeChanged':
      return { ...state, closestEdge: action.closestEdge };
    case 'detailsOpenChanged':
      return { ...state, detailsOpen: action.open };
    case 'draggingChanged':
      return { ...state, isDragging: action.isDragging };
  }
};

const Card = ({
  activeCardId,
  card,
  columnId,
  columns,
  deleteCard,
  editCard,
  onTagsChange,
  onActiveCardClose,
  tags,
}: CardProps) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const ignoreNextClickRef = useRef(false);
  const resetIgnoreClickTimerRef = useRef<number | null>(null);
  const [state, dispatch] = useReducer(cardReducer, {
    closestEdge: null,
    detailsOpen: false,
    isDragging: false,
  });
  const { closestEdge, detailsOpen, isDragging } = state;
  const routeDetailsOpen = activeCardId === card.id;
  const dialogOpen = detailsOpen || routeDetailsOpen;

  const openCard = () => navigate(createActiveCardPath(card.id));

  const setCardDraggingEnabled = (enabled: boolean) => {
    const cardElement = cardRef.current;

    if (cardElement) {
      cardElement.draggable = enabled;
    }
  };

  useEffect(() => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    const cleanup = combine(
      draggable({
        element: cardElement,
        getInitialData: () => ({ cardId: card.id, columnId, type: 'card' }),
        onDragStart: () => {
          ignoreNextClickRef.current = true;
          dispatch({ isDragging: true, type: 'draggingChanged' });
        },
        onDrop: () => {
          dispatch({ isDragging: false, type: 'draggingChanged' });

          if (resetIgnoreClickTimerRef.current) {
            window.clearTimeout(resetIgnoreClickTimerRef.current);
          }

          resetIgnoreClickTimerRef.current = window.setTimeout(() => {
            ignoreNextClickRef.current = false;
            resetIgnoreClickTimerRef.current = null;
          }, 0);
        },
      }),
      dropTargetForElements({
        element: cardElement,
        canDrop: ({ source }) =>
          isCardDragData(source.data) && source.data.cardId !== card.id,
        getData: ({ element, input }) =>
          attachClosestEdge(
            { cardId: card.id, columnId, type: 'card' },
            { allowedEdges: ['top', 'bottom'], element, input }
          ),
        onDrag: ({ self }) =>
          dispatch({
            closestEdge: extractClosestEdge(self.data),
            type: 'closestEdgeChanged',
          }),
        onDragEnter: ({ self }) =>
          dispatch({
            closestEdge: extractClosestEdge(self.data),
            type: 'closestEdgeChanged',
          }),
        onDragLeave: () =>
          dispatch({ closestEdge: null, type: 'closestEdgeChanged' }),
        onDrop: () =>
          dispatch({ closestEdge: null, type: 'closestEdgeChanged' }),
      })
    );

    return cleanup;
  }, [card.id, columnId]);

  useEffect(() => {
    const titleElement = titleRef.current;

    if (!titleElement) {
      return;
    }

    const disableDragging = () => setCardDraggingEnabled(false);
    const enableDragging = () => setCardDraggingEnabled(true);

    titleElement.addEventListener('mouseenter', disableDragging);
    titleElement.addEventListener('mousedown', disableDragging);
    titleElement.addEventListener('mouseleave', enableDragging);

    return () => {
      titleElement.removeEventListener('mouseenter', disableDragging);
      titleElement.removeEventListener('mousedown', disableDragging);
      titleElement.removeEventListener('mouseleave', enableDragging);
    };
  }, []);

  useEffect(
    () => () => {
      if (resetIgnoreClickTimerRef.current) {
        window.clearTimeout(resetIgnoreClickTimerRef.current);
      }
    },
    []
  );

  const onCardClick = (event: MouseEvent<HTMLElement>) => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    if (ignoreNextClickRef.current || hasSelectionInside(cardElement)) {
      ignoreNextClickRef.current = false;
      event.preventDefault();
      return;
    }

    openCard();
  };

  const cardTags = card.tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is BoardTag => Boolean(tag));
  const visibleTags = cardTags.slice(0, 2);
  const hiddenTagCount = cardTags.length - visibleTags.length;
  const { messages } = useLocalization();

  return (
    <>
      <article
        className={`card ${isDragging ? 'card--dragging' : ''}`}
        ref={cardRef}
      >
        {closestEdge && (
          <span
            className={`card__drop-indicator card__drop-indicator--${closestEdge}`}
          />
        )}
        <button
          aria-label={messages.card.openCard(card.title)}
          className="card__body"
          onClick={onCardClick}
          type="button"
        >
          <div className="card__title-row">
            <span className="card__title" draggable={false} ref={titleRef}>
              {card.title}
            </span>
            {card.content && (
              <AlignLeft
                aria-label={messages.card.hasContent}
                className="card__content-icon"
                size={13}
              />
            )}
          </div>
          <CardMetadata
            hiddenTagCount={hiddenTagCount}
            priority={card.priority}
            tags={visibleTags}
          />
        </button>
      </article>
      <CardDialog
        card={card}
        columnId={columnId}
        columns={columns}
        onDelete={() => deleteCard(columnId, card.id)}
        onTagsChange={onTagsChange}
        onOpenChange={(open) => {
          if (!open && routeDetailsOpen) {
            onActiveCardClose();
            return;
          }

          dispatch({ open, type: 'detailsOpenChanged' });
        }}
        onSave={(values) => editCard(columnId, card.id, values)}
        open={dialogOpen}
        tags={tags}
      />
    </>
  );
};

export default Card;
