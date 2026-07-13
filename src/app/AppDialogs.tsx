import BoardSettingsDialog from '../components/BoardSettingsDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import TagManagerDialog from '../components/TagManagerDialog';
import { fetchStorage } from '../storage';
import type { BoardActiveWorkCycle, BoardColumn, BoardTag } from '../types';

const getTagUsageCount = (tagId: string) =>
  fetchStorage().reduce(
    (count, column) =>
      count + column.cards.filter((card) => card.tagIds.includes(tagId)).length,
    0
  );

type AppDialogsProps = {
  activeWorkCycle: BoardActiveWorkCycle;
  boardSettingsOpen: boolean;
  clearBoardOpen: boolean;
  columnCount: number;
  columns: BoardColumn[];
  completeWorkOpen: boolean;
  completedCardCount: number;
  completedColumn: BoardColumn | undefined;
  onBoardSettingsOpenChange: (open: boolean) => void;
  onClearBoard: () => void;
  onClearBoardOpenChange: (open: boolean) => void;
  onClearBoardRequest: () => void;
  onCompleteWork: () => void;
  onCompleteWorkOpenChange: (open: boolean) => void;
  onCompletedColumnChange: (completedColumnId: string | null) => void;
  onDeleteTag: (tagId: string) => void;
  onTagManagerOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  routeManagementOpen: boolean;
  tagManagerOpen: boolean;
  tags: BoardTag[];
};

const AppDialogs = ({
  activeWorkCycle,
  boardSettingsOpen,
  clearBoardOpen,
  columnCount,
  columns,
  completeWorkOpen,
  completedCardCount,
  completedColumn,
  onBoardSettingsOpenChange,
  onClearBoard,
  onClearBoardOpenChange,
  onClearBoardRequest,
  onCompleteWork,
  onCompleteWorkOpenChange,
  onCompletedColumnChange,
  onDeleteTag,
  onTagManagerOpenChange,
  onTagsChange,
  routeManagementOpen,
  tagManagerOpen,
  tags,
}: AppDialogsProps) => (
  <>
    <BoardSettingsDialog
      canClearBoard={columnCount > 0}
      columns={columns}
      completedColumnId={activeWorkCycle.completedColumnId}
      onClearBoard={onClearBoardRequest}
      onCompletedColumnChange={onCompletedColumnChange}
      onOpenChange={onBoardSettingsOpenChange}
      open={boardSettingsOpen}
      routeOwned={routeManagementOpen}
    />
    <TagManagerDialog
      getTagUsageCount={getTagUsageCount}
      onDeleteTag={onDeleteTag}
      onOpenChange={onTagManagerOpenChange}
      onTagsChange={onTagsChange}
      open={tagManagerOpen}
      routeOwned={routeManagementOpen}
      tags={tags}
    />
    <ConfirmDialog
      confirmLabel="Clear board"
      description={`This will permanently delete ${columnCount} columns and all of their cards.`}
      onConfirm={onClearBoard}
      onOpenChange={onClearBoardOpenChange}
      open={clearBoardOpen}
      title="Clear this board?"
    />
    <ConfirmDialog
      confirmLabel="Complete work"
      confirmVariant="primary"
      description={
        completedColumn
          ? `This will archive ${completedCardCount} ${completedCardCount === 1 ? 'card' : 'cards'} from ${completedColumn.title} and start a new work cycle.`
          : 'Choose a completed column in board settings before completing work.'
      }
      onConfirm={onCompleteWork}
      onOpenChange={onCompleteWorkOpenChange}
      open={completeWorkOpen}
      title="Complete work?"
    />
  </>
);

export default AppDialogs;
