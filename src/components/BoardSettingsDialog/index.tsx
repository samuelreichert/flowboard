import { Button } from '@base-ui/react/button';
import { RotateCcw, Settings } from 'lucide-react';

import type { BoardColumn } from '../../types';
import DialogSelect from '../DialogSelect';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';

import '../SettingsDialog/SettingsDialog.css';

type BoardSettingsDialogProps = {
  canClearBoard: boolean;
  completedColumnId: string | null;
  columns: BoardColumn[];
  onClearBoard: () => void;
  onCompletedColumnChange: (columnId: string | null) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  routeOwned?: boolean;
};

const UNSET_COMPLETED_COLUMN = '__unset__';

const BoardSettingsDialog = ({
  canClearBoard,
  completedColumnId,
  columns,
  onClearBoard,
  onCompletedColumnChange,
  onOpenChange,
  open,
  routeOwned = false,
}: BoardSettingsDialogProps) => {
  const hasColumns = columns.length > 0;
  const selectedValue = completedColumnId ?? UNSET_COMPLETED_COLUMN;

  return (
    <DialogShell
      actions={
        <Button
          className="button button--primary board-settings__done-button"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          Done
        </Button>
      }
      closeLabel="Close board settings"
      description="Choose which column Flowboard should archive when you complete work."
      onOpenChange={onOpenChange}
      open={open}
      popupClassName={routeOwned ? 'dialog-popup--route-management' : undefined}
      title="Board settings"
    >
      <div className="board-settings__content">
        <div className="dialog-field board-settings__section">
          <div className="board-settings__label-row">
            <Settings size={15} />
            <span className="dialog-label">Completed column</span>
          </div>
          {hasColumns ? (
            <DialogSelect
              ariaLabel="Completed column"
              name="completed-column"
              onValueChange={(value) =>
                onCompletedColumnChange(
                  value === UNSET_COMPLETED_COLUMN ? null : value
                )
              }
              options={[
                {
                  label: 'No completed column',
                  value: UNSET_COMPLETED_COLUMN,
                },
                ...columns.map((column) => ({
                  label: column.title,
                  value: column.id,
                })),
              ]}
              renderValue={(value) => {
                if (!value || value === UNSET_COMPLETED_COLUMN) {
                  return 'Choose completed column';
                }

                return (
                  columns.find((column) => column.id === value)?.title ??
                  'Choose completed column'
                );
              }}
              value={selectedValue}
            />
          ) : (
            <InlineEmptyState variant="surface">
              Create a column before choosing where completed work lives.
            </InlineEmptyState>
          )}
        </div>
        {canClearBoard && (
          <div className="board-settings__danger-zone board-settings__section">
            <div>
              <p className="board-settings__danger-title">Clear board</p>
              <p className="board-settings__danger-description">
                Permanently delete all columns and cards from this board.
              </p>
            </div>
            <Button
              aria-label="Clear board"
              className="button button--subtle board-settings__danger-button"
              onClick={onClearBoard}
              type="button"
            >
              <RotateCcw size={15} />
              <span>Clear board</span>
            </Button>
          </div>
        )}
      </div>
    </DialogShell>
  );
};

export default BoardSettingsDialog;
