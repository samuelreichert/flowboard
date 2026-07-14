import AppSettingsDialog from '../components/AppSettingsDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import ProfileDialog from '../components/ProfileDialog';
import type { ProfileDialogValues } from '../components/ProfileDialog';
import TagManagerDialog from '../components/TagManagerDialog';
import { fetchStorage } from '../storage';
import type { AuthenticatedProfile } from '../storage/authenticatedApi';
import type { ThemePreference } from '../theme';
import type { BoardActiveWorkCycle, BoardColumn, BoardTag } from '../types';

const getTagUsageCount = (tagId: string) =>
  fetchStorage().reduce(
    (count, column) =>
      count + column.cards.filter((card) => card.tagIds.includes(tagId)).length,
    0
  );

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
  onProfileOpenChange: (open: boolean) => void;
  onProfileSave: (values: ProfileDialogValues) => Promise<void>;
  onSettingsOpenChange: (open: boolean) => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  onTagManagerOpenChange: (open: boolean) => void;
  onTagsChange: (tags: BoardTag[]) => void;
  routeManagementOpen: boolean;
  profileError: string | null;
  profileOpen: boolean;
  profileSaving: boolean;
  settingsOpen: boolean;
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
  onProfileOpenChange,
  onProfileSave,
  onSettingsOpenChange,
  onThemePreferenceChange,
  onTagManagerOpenChange,
  onTagsChange,
  routeManagementOpen,
  profileError,
  profileOpen,
  profileSaving,
  settingsOpen,
  tagManagerOpen,
  tags,
  themePreference,
}: AppDialogsProps) => (
  <>
    <AppSettingsDialog
      canClearBoard={columnCount > 0}
      columns={columns}
      completedColumnId={activeWorkCycle.completedColumnId}
      onClearBoard={onClearBoardRequest}
      onCompletedColumnChange={onCompletedColumnChange}
      onOpenChange={onSettingsOpenChange}
      onThemePreferenceChange={onThemePreferenceChange}
      open={settingsOpen}
      routeOwned={routeManagementOpen}
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
          : 'Choose a completed column in settings before completing work.'
      }
      onConfirm={onCompleteWork}
      onOpenChange={onCompleteWorkOpenChange}
      open={completeWorkOpen}
      title="Complete work?"
    />
  </>
);

export default AppDialogs;
