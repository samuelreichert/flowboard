import { Button } from '@base-ui/react/button';
import { Columns3, Plus } from 'lucide-react';
import { useEffect } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { ColumnMoveDirection } from '../../board/columns';
import Column from '../Column';
import type { CardDialogSaveValues } from '../CardDialog';
import { EmptyState } from '../EmptyState';
import type { BoardColumn, BoardTag } from '../../types';
import { useHorizontalOverflow } from './useHorizontalOverflow';

type ColumnListProps = {
  activeCardId: string | null;
  cardDetailAccessToken?: string;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  deleteColumn: (columnId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogSaveValues
  ) => string | void;
  moveColumn: (columnId: string, direction: ColumnMoveDirection) => void;
  onActiveCardClose: () => void;
  onAddColumnClick: () => void;
  onHorizontalOverflowChange: (hasOverflow: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  renameColumn: (columnId: string, title: string) => string | void;
  tags: BoardTag[];
};

const ColumnList = ({
  activeCardId,
  cardDetailAccessToken,
  columns,
  deleteCard,
  deleteColumn,
  editCard,
  moveColumn,
  onActiveCardClose,
  onAddColumnClick,
  onHorizontalOverflowChange,
  onTagsChange,
  renameColumn,
  tags,
}: ColumnListProps) => {
  const { messages } = useLocalization();
  const {
    columnsListRef,
    hasOverflow,
    onColumnsScroll,
    onColumnsWheel,
    onScrollRailScroll,
    scrollRailRef,
    scrollWidth,
  } = useHorizontalOverflow(columns.length);

  useEffect(() => {
    onHorizontalOverflowChange(hasOverflow);

    return () => onHorizontalOverflowChange(false);
  }, [hasOverflow, onHorizontalOverflowChange]);

  if (columns.length === 0) {
    return (
      <div className="columns-list columns-list--empty">
        <EmptyState
          className="columns-empty-state"
          icon={<Columns3 size={22} />}
          title={messages.board.emptyBoardTitle}
        >
          {messages.board.emptyBoardDescription}
        </EmptyState>
        <Button
          className="button button--primary columns-empty-state__action"
          onClick={onAddColumnClick}
          type="button"
        >
          <Plus size={15} />
          <span>{messages.board.createFirstColumn}</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div
        className="columns-list"
        onScroll={onColumnsScroll}
        onWheel={onColumnsWheel}
        ref={columnsListRef}
      >
        {columns.map((column) => (
          <Column
            activeCardId={activeCardId}
            cardDetailAccessToken={cardDetailAccessToken}
            column={column}
            columns={columns}
            deleteCard={deleteCard}
            deleteColumn={deleteColumn}
            editCard={editCard}
            key={column.id}
            moveColumn={moveColumn}
            onActiveCardClose={onActiveCardClose}
            onTagsChange={onTagsChange}
            renameColumn={renameColumn}
            tags={tags}
          />
        ))}
        <Button className="add-column-placeholder" onClick={onAddColumnClick}>
          <Plus size={16} />
          {messages.board.addAnotherColumn}
        </Button>
      </div>
      <div
        aria-label="Horizontal board scroll"
        className="columns-scroll-rail"
        onScroll={onScrollRailScroll}
        ref={scrollRailRef}
        tabIndex={0}
      >
        <div style={{ width: scrollWidth }} />
      </div>
    </>
  );
};

export default ColumnList;
