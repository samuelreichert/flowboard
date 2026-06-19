import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { Select } from '@base-ui/react/select';
import { Check, ChevronDown, RotateCcw, Settings, X } from 'lucide-react';

import type { BoardColumn } from '../../types';
import '../IconButton/IconButton.css';

type BoardSettingsDialogProps = {
  canClearBoard: boolean;
  completedColumnId: string | null;
  columns: BoardColumn[];
  onClearBoard: () => void;
  onCompletedColumnChange: (columnId: string | null) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
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
}: BoardSettingsDialogProps) => {
  const hasColumns = columns.length > 0;
  const selectedValue = completedColumnId ?? UNSET_COMPLETED_COLUMN;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Viewport className="dialog-viewport">
          <Dialog.Popup className="dialog-popup">
            <div className="dialog-header">
              <div>
                <Dialog.Title className="dialog-title">
                  Board settings
                </Dialog.Title>
                <Dialog.Description className="dialog-description">
                  Choose which column Flowboard should archive when you complete
                  work.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close board settings"
                className="icon-button dialog-close"
                render={<Button />}
              >
                <X size={17} />
              </Dialog.Close>
            </div>
            <div className="board-settings__content">
              <div className="dialog-field board-settings__section">
                <div className="board-settings__label-row">
                  <Settings size={15} />
                  <span className="dialog-label">Completed column</span>
                </div>
                {hasColumns ? (
                  <Select.Root
                    name="completed-column"
                    onValueChange={(value) =>
                      onCompletedColumnChange(
                        value === UNSET_COMPLETED_COLUMN ? null : value
                      )
                    }
                    value={selectedValue}
                  >
                    <Select.Trigger
                      aria-label="Completed column"
                      className="dialog-input dialog-select__trigger"
                    >
                      <Select.Value className="dialog-select__value">
                        {(value: string | null) => {
                          if (!value || value === UNSET_COMPLETED_COLUMN) {
                            return 'Choose completed column';
                          }

                          return (
                            columns.find((column) => column.id === value)
                              ?.title ?? 'Choose completed column'
                          );
                        }}
                      </Select.Value>
                      <Select.Icon className="dialog-select__icon">
                        <ChevronDown size={17} />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        align="start"
                        className="dialog-select__positioner"
                        sideOffset={5}
                      >
                        <Select.Popup className="dialog-select__popup">
                          <Select.List>
                            <Select.Item
                              className="dialog-select__item"
                              value={UNSET_COMPLETED_COLUMN}
                            >
                              <Select.ItemText>
                                No completed column
                              </Select.ItemText>
                              <Select.ItemIndicator>
                                <Check size={15} />
                              </Select.ItemIndicator>
                            </Select.Item>
                            {columns.map((column) => (
                              <Select.Item
                                className="dialog-select__item"
                                key={column.id}
                                value={column.id}
                              >
                                <Select.ItemText>
                                  {column.title}
                                </Select.ItemText>
                                <Select.ItemIndicator>
                                  <Check size={15} />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.List>
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                ) : (
                  <p className="board-settings__empty">
                    Create a column before choosing where completed work lives.
                  </p>
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
            <div className="dialog-actions">
              <Dialog.Close
                className="button button--primary board-settings__done-button"
                render={<Button />}
              >
                Done
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BoardSettingsDialog;
