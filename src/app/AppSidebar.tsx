import { Button } from '@base-ui/react/button';
import {
  History,
  KanbanSquare,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  Tags,
  X,
} from 'lucide-react';

import SegmentedControl from '../components/SegmentedControl';
import type { SegmentedControlOption } from '../components/SegmentedControl';
import type { ResolvedTheme, ThemePreference } from '../theme';
import { getThemeIconSrc } from './appTheme';
import type { AppView } from './appTypes';

const THEME_OPTIONS: SegmentedControlOption<ThemePreference>[] = [
  { icon: <Monitor size={16} />, label: 'System', value: 'system' },
  { icon: <Sun size={16} />, label: 'Light', value: 'light' },
  { icon: <Moon size={16} />, label: 'Dark', value: 'dark' },
];

type AppSidebarProps = {
  currentView: AppView;
  onBoardClick: () => void;
  onBoardSettingsClick: () => void;
  onCloseMobileSidebar: () => void;
  onHistoryClick: () => void;
  onManageTagsClick: () => void;
  onThemePreferenceChange: (preference: ThemePreference) => void;
  onToggleSidebar: () => void;
  resolvedTheme: ResolvedTheme;
  sidebarExpanded: boolean;
  themePreference: ThemePreference;
};

const AppSidebar = ({
  currentView,
  onBoardClick,
  onBoardSettingsClick,
  onCloseMobileSidebar,
  onHistoryClick,
  onManageTagsClick,
  onThemePreferenceChange,
  onToggleSidebar,
  resolvedTheme,
  sidebarExpanded,
  themePreference,
}: AppSidebarProps) => (
  <aside
    aria-label="Flowboard navigation"
    className="app-sidebar"
    data-expanded={sidebarExpanded}
  >
    <div className="app-sidebar__header">
      <Button
        aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        className="icon-button app-sidebar__toggle"
        onClick={onToggleSidebar}
        type="button"
      >
        {sidebarExpanded ? (
          <PanelLeftClose size={18} />
        ) : (
          <PanelLeftOpen size={18} />
        )}
      </Button>
      <div className="app-sidebar__brand">
        <img
          alt=""
          aria-hidden="true"
          className="app-sidebar__brand-icon"
          src={getThemeIconSrc(resolvedTheme)}
        />
        <span className="app-sidebar__brand-text">Flowboard</span>
      </div>
      <Button
        aria-label="Close navigation"
        className="icon-button app-sidebar__mobile-close"
        onClick={onCloseMobileSidebar}
        type="button"
      >
        <X size={18} />
      </Button>
    </div>
    <nav className="app-sidebar__nav" aria-label="Primary navigation">
      <Button
        aria-current={currentView === 'board' ? 'page' : undefined}
        aria-label="Board"
        className={`app-sidebar__nav-item ${currentView === 'board' ? 'app-sidebar__nav-item--active' : ''}`}
        onClick={onBoardClick}
        title="Board"
        type="button"
      >
        <KanbanSquare size={18} />
        <span>Board</span>
      </Button>
      <Button
        aria-current={currentView === 'history' ? 'page' : undefined}
        aria-label="History"
        className={`app-sidebar__nav-item ${currentView === 'history' ? 'app-sidebar__nav-item--active' : ''}`}
        onClick={onHistoryClick}
        title="History"
        type="button"
      >
        <History size={18} />
        <span>History</span>
      </Button>
      <Button
        aria-label="Manage tags"
        className="app-sidebar__nav-item"
        onClick={onManageTagsClick}
        title="Tags"
        type="button"
      >
        <Tags size={18} />
        <span>Tags</span>
      </Button>
      <Button
        aria-label="Board settings"
        className="app-sidebar__nav-item"
        onClick={onBoardSettingsClick}
        title="Board settings"
        type="button"
      >
        <Settings size={18} />
        <span>Board settings</span>
      </Button>
    </nav>
    <div className="app-sidebar__footer">
      <p className="app-sidebar__footer-label">Theme</p>
      <SegmentedControl
        ariaLabel="Theme preference"
        className="app-sidebar__theme-control"
        onValueChange={onThemePreferenceChange}
        options={THEME_OPTIONS.map((option) => ({
          ...option,
          ariaLabel: `Use ${option.label.toLowerCase()} theme`,
        }))}
        value={themePreference}
      />
    </div>
  </aside>
);

export default AppSidebar;
