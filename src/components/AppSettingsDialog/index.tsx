import { Button } from '@base-ui/react/button';
import {
  Languages,
  Monitor,
  Moon,
  RotateCcw,
  Settings,
  Sun,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import type { LanguagePreference, ResolvedLanguage } from '../../localization';
import type { ThemePreference } from '../../theme';
import type { BoardColumn } from '../../types';
import DialogSelect from '../DialogSelect';
import DialogShell from '../DialogShell';
import { InlineEmptyState } from '../EmptyState';
import SegmentedControl from '../SegmentedControl';
import type { SegmentedControlOption } from '../SegmentedControl';

import '../SettingsDialog/SettingsDialog.css';
import './AppSettingsDialog.css';

type AppSettingsSectionProps = {
  children: ReactNode;
  icon: ReactNode;
  id: string;
  title: string;
};

type AppSettingsDialogProps = {
  canClearBoard: boolean;
  completedColumnId: string | null;
  columns: BoardColumn[];
  onClearBoard: () => void;
  onCompletedColumnChange: (columnId: string | null) => void;
  onLanguagePreferenceChange: (preference: LanguagePreference) => void;
  onOpenChange: (open: boolean) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  languagePreference: LanguagePreference;
  open: boolean;
  routeOwned?: boolean;
  systemLanguage: ResolvedLanguage;
  themePreference: ThemePreference;
};

const UNSET_COMPLETED_COLUMN = '__unset__';

const AppSettingsSection = ({
  children,
  icon,
  id,
  title,
}: AppSettingsSectionProps) => (
  <section className="app-settings__section" aria-labelledby={id}>
    <div className="board-settings__label-row">
      {icon}
      <h2 className="app-settings__section-title" id={id}>
        {title}
      </h2>
    </div>
    {children}
  </section>
);

const AppSettingsDialog = ({
  canClearBoard,
  completedColumnId,
  columns,
  onClearBoard,
  onCompletedColumnChange,
  onLanguagePreferenceChange,
  onOpenChange,
  onThemePreferenceChange,
  languagePreference,
  open,
  routeOwned = false,
  systemLanguage,
  themePreference,
}: AppSettingsDialogProps) => {
  const { messages } = useLocalization();
  const themeOptions: SegmentedControlOption<ThemePreference>[] = [
    {
      icon: <Monitor size={16} />,
      label: messages.theme.system,
      value: 'system',
    },
    { icon: <Sun size={16} />, label: messages.theme.light, value: 'light' },
    { icon: <Moon size={16} />, label: messages.theme.dark, value: 'dark' },
  ];
  const languageOptions = [
    {
      label: messages.language.browserOption(
        messages.language.languageName[systemLanguage]
      ),
      value: 'system',
    },
    { label: messages.language.english, value: 'en' },
    { label: messages.language.portugueseBrazil, value: 'pt-BR' },
  ] satisfies { label: string; value: LanguagePreference }[];
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
          {messages.common.done}
        </Button>
      }
      closeLabel={messages.settings.closeSettings}
      onOpenChange={onOpenChange}
      open={open}
      popupClassName={routeOwned ? 'dialog-popup--route-management' : undefined}
      title={messages.settings.title}
    >
      <div className="app-settings__content">
        <AppSettingsSection
          icon={<Sun size={15} />}
          id="appearance-settings-title"
          title={messages.settings.appearance}
        >
          <SegmentedControl
            ariaLabel={messages.settings.themePreference}
            className="app-settings__theme-control"
            onValueChange={onThemePreferenceChange}
            options={themeOptions.map((option) => ({
              ...option,
              ariaLabel: messages.theme.useTheme(option.label),
            }))}
            value={themePreference}
          />
        </AppSettingsSection>
        <AppSettingsSection
          icon={<Languages size={15} />}
          id="language-settings-title"
          title={messages.language.title}
        >
          <DialogSelect
            ariaLabel={messages.language.preferenceLabel}
            name="language-preference"
            onValueChange={onLanguagePreferenceChange}
            options={languageOptions}
            renderValue={(value) =>
              languageOptions.find((option) => option.value === value)
                ?.label ?? messages.language.english
            }
            value={languagePreference}
          />
        </AppSettingsSection>
        <AppSettingsSection
          icon={<Settings size={15} />}
          id="board-settings-title"
          title={messages.settings.board}
        >
          <div className="dialog-field app-settings__field">
            <span className="dialog-label">
              {messages.settings.completedColumn}
            </span>
            {hasColumns ? (
              <DialogSelect
                ariaLabel={messages.settings.completedColumn}
                name="completed-column"
                onValueChange={(value) =>
                  onCompletedColumnChange(
                    value === UNSET_COMPLETED_COLUMN ? null : value
                  )
                }
                options={[
                  {
                    label: messages.settings.noCompletedColumn,
                    value: UNSET_COMPLETED_COLUMN,
                  },
                  ...columns.map((column) => ({
                    label: column.title,
                    value: column.id,
                  })),
                ]}
                renderValue={(value) => {
                  if (!value || value === UNSET_COMPLETED_COLUMN) {
                    return messages.settings.chooseCompletedColumn;
                  }

                  return (
                    columns.find((column) => column.id === value)?.title ??
                    messages.settings.chooseCompletedColumn
                  );
                }}
                value={selectedValue}
              />
            ) : (
              <InlineEmptyState variant="surface">
                {messages.settings.createColumnBeforeCompleted}
              </InlineEmptyState>
            )}
          </div>
        </AppSettingsSection>
        {canClearBoard && (
          <section className="board-settings__danger-zone board-settings__section">
            <div>
              <p className="board-settings__danger-title">
                {messages.settings.clearBoard}
              </p>
              <p className="board-settings__danger-description">
                {messages.settings.clearBoardDescription}
              </p>
            </div>
            <Button
              aria-label={messages.settings.clearBoardAriaLabel}
              className="button button--subtle board-settings__danger-button"
              onClick={onClearBoard}
              type="button"
            >
              <RotateCcw size={15} />
              <span>{messages.settings.clearBoard}</span>
            </Button>
          </section>
        )}
      </div>
    </DialogShell>
  );
};

export default AppSettingsDialog;
