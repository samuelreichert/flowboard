import { Button } from '@base-ui/react/button';
import { Monitor, Moon, RotateCcw, Settings, Sun } from 'lucide-react';

import type { ThemePreference } from '../../theme';
import type { BoardColumn } from '../../types';
import DialogSelect from '../DialogSelect';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';
import SegmentedControl from '../SegmentedControl';
import type { SegmentedControlOption } from '../SegmentedControl';

type AppSettingsDialogProps = {
  canClearBoard: boolean;
  completedColumnId: string | null;
  columns: BoardColumn[];
  onClearBoard: () => void;
  onCompletedColumnChange: (columnId: string | null) => void;
  onOpenChange: (open: boolean) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  open: boolean;
  routeOwned?: boolean;
  themePreference: ThemePreference;
};

const THEME_OPTIONS: SegmentedControlOption<ThemePreference>[] = [
  { icon: <Monitor size={16} />, label: 'System', value: 'system' },
  { icon: <Sun size={16} />, label: 'Light', value: 'light' },
  { icon: <Moon size={16} />, label: 'Dark', value: 'dark' },
];

const UNSET_COMPLETED_COLUMN = '__unset__';

const AppSettingsDialog = ({
  canClearBoard,
  completedColumnId,
  columns,
  onClearBoard,
  onCompletedColumnChange,
  onOpenChange,
  onThemePreferenceChange,
  open,
  routeOwned = false,
  themePreference,
}: AppSettingsDialogProps) => {
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
      closeLabel="Close settings"
      onOpenChange={onOpenChange}
      open={open}
      popupClassName={routeOwned ? 'dialog-popup--route-management' : undefined}
      title="Settings"
    >
      <div className="app-settings__content">
        <section className="app-settings__section" aria-labelledby="appearance-settings-title">
          <div className="board-settings__label-row">
            <Sun size={15} />
            <h2 className="app-settings__section-title" id="appearance-settings-title">
              Appearance
            </h2>
          </div>
          <SegmentedControl
            ariaLabel="Theme preference"
            className="app-settings__theme-control"
            onValueChange={onThemePreferenceChange}
            options={THEME_OPTIONS.map((option) => ({
              ...option,
              ariaLabel: `Use ${option.label.toLowerCase()} theme`,
            }))}
            value={themePreference}
          />
        </section>
        <section className="app-settings__section" aria-labelledby="board-settings-title">
          <div className="board-settings__label-row">
            <Settings size={15} />
            <h2 className="app-settings__section-title" id="board-settings-title">
              Board
            </h2>
          </div>
          <div className="dialog-field board-settings__section">
            <span className="dialog-label">Completed column</span>
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
        </section>
        {canClearBoard && (
          <section className="board-settings__danger-zone board-settings__section">
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
          </section>
        )}
      </div>
    </DialogShell>
  );
};

export default AppSettingsDialog;
