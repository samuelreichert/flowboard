import { Button } from '@base-ui/react/button';
import { Plus } from 'lucide-react';

import { useLocalization } from '../../LocalizationProvider';
import type { ColumnMoveDirection } from '../../board/columns';
import Column from '../Column';
import type { CardDialogValues } from '../CardDialog';
import type { BoardColumn, BoardTag } from '../../types';

type ColumnListProps = {
  activeCardId: string | null;
  cardDetailAccessToken?: string;
  columns: BoardColumn[];
  deleteCard: (columnId: string, cardId: string) => void;
  deleteColumn: (columnId: string) => void;
  editCard: (
    columnId: string,
    cardId: string,
    values: CardDialogValues
  ) => string | void;
  moveColumn: (columnId: string, direction: ColumnMoveDirection) => void;
  onActiveCardClose: () => void;
  onAddColumnClick: () => void;
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
  onTagsChange,
  renameColumn,
  tags,
}: ColumnListProps) => {
  const { messages } = useLocalization();

  return (
    <div className="columns-list">
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
  );
};

export default ColumnList;
