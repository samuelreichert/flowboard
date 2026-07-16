import AppSettingsDialog from '../components/AppSettingsDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import ProfileDialog from '../components/ProfileDialog';
import type { ProfileDialogValues } from '../components/ProfileDialog';
import TagManagerDialog from '../components/TagManagerDialog';
import { useLocalization } from '../LocalizationProvider';
import { countTagUsage } from '../board/tags';
import { fetchStorage } from '../storage';
import type { AuthenticatedProfile } from '../storage/authenticatedApi';
import type { LanguagePreference, ResolvedLanguage } from '../localization';
import type { ThemePreference } from '../theme';
import type { BoardActiveWorkCycle, BoardColumn, BoardTag } from '../types';

const getTagUsageCount = (tagId: string) =>
  countTagUsage(fetchStorage(), tagId);

type AppDialogsProps = {
  activeWorkCycle: BoardActiveWorkCycle;
  authenticatedProfile: AuthenticatedProfile | null;
  clearBoardOpen: boolean;
  columnCount: number;
  columns: BoardColumn[];
  completeWorkOpen: boolean;
  completedCardCount: number;
  completedColumn: BoardColumn | undefined;
  onClearBoard: () => void;
  onClearBoardOpenChange: (open: boolean) => void;
  onClearBoardRequest: () => void;
  onCompleteWork: () => void;
  onCompleteWorkOpenChange: (open: boolean) => void;
  onCompletedColumnChange: (completedColumnId: string | null) => void;
  onDeleteTag: (tagId: string) => void;
  onLanguagePreferenceChange: (preference: LanguagePreference) => void;
  onProfileOpenChange: (open: boolean) => void;
  onProfileSave: (values: ProfileDialogValues) => Promise<void>;
  onSettingsOpenChange: (open: boolean) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  onTagManagerOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  languagePreference: LanguagePreference;
  routeManagementOpen: boolean;
  profileError: string | null;
  profileOpen: boolean;
  profileSaving: boolean;
  settingsOpen: boolean;
  systemLanguage: ResolvedLanguage;
  tagManagerOpen: boolean;
  tags: BoardTag[];
  themePreference: ThemePreference;
};

const AppDialogs = ({
  activeWorkCycle,
  authenticatedProfile,
  clearBoardOpen,
  columnCount,
  columns,
  completeWorkOpen,
  completedCardCount,
  completedColumn,
  onClearBoard,
  onClearBoardOpenChange,
  onClearBoardRequest,
  onCompleteWork,
  onCompleteWorkOpenChange,
  onCompletedColumnChange,
  onDeleteTag,
  onLanguagePreferenceChange,
  onProfileOpenChange,
  onProfileSave,
  onSettingsOpenChange,
  onThemePreferenceChange,
  onTagManagerOpenChange,
  onTagsChange,
  languagePreference,
  routeManagementOpen,
  profileError,
  profileOpen,
  profileSaving,
  settingsOpen,
  systemLanguage,
  tagManagerOpen,
  tags,
  themePreference,
}: AppDialogsProps) => {
  const { messages } = useLocalization();

  return (
    <>
      <AppSettingsDialog
        canClearBoard={columnCount > 0}
        columns={columns}
        completedColumnId={activeWorkCycle.completedColumnId}
        onClearBoard={onClearBoardRequest}
        onCompletedColumnChange={onCompletedColumnChange}
        onLanguagePreferenceChange={onLanguagePreferenceChange}
        onOpenChange={onSettingsOpenChange}
        onThemePreferenceChange={onThemePreferenceChange}
        languagePreference={languagePreference}
        open={settingsOpen}
        routeOwned={routeManagementOpen}
        systemLanguage={systemLanguage}
        themePreference={themePreference}
      />
      <ProfileDialog
        error={profileError}
        onOpenChange={onProfileOpenChange}
        onSave={onProfileSave}
        open={profileOpen}
        profile={authenticatedProfile}
        saving={profileSaving}
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
        confirmLabel={messages.confirmations.clearBoardConfirm}
        description={messages.confirmations.clearBoardDescription(columnCount)}
        onConfirm={onClearBoard}
        onOpenChange={onClearBoardOpenChange}
        open={clearBoardOpen}
        title={messages.confirmations.clearBoardTitle}
      />
      <ConfirmDialog
        confirmLabel={messages.confirmations.completeWorkConfirm}
        confirmVariant="primary"
        description={
          completedColumn
            ? messages.confirmations.completeWorkDescription(
                completedCardCount,
                completedColumn.title
              )
            : messages.app.workspace.completeWorkNeedsColumn
        }
        onConfirm={onCompleteWork}
        onOpenChange={onCompleteWorkOpenChange}
        open={completeWorkOpen}
        title={messages.confirmations.completeWorkTitle}
      />
    </>
  );
};

export default AppDialogs;
