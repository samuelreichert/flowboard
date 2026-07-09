import {
  History,
  KanbanSquare,
  Monitor,
  Moon,
  PanelLeftClose,
  Settings,
  Sun,
  Tags,
  X,
} from 'lucide-react';

import SegmentedControl from '../components/SegmentedControl';
import type { SegmentedControlOption } from '../components/SegmentedControl';
import Sidebar from '../components/Sidebar';
import type { SidebarNavItem } from '../components/Sidebar';
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
}: AppSidebarProps) => {
  const navItems: SidebarNavItem[] = [
    {
      active: currentView === 'board',
      icon: <KanbanSquare size={18} />,
      id: 'board',
      label: 'Board',
      onClick: onBoardClick,
    },
    {
      active: currentView === 'history',
      icon: <History size={18} />,
      id: 'history',
      label: 'History',
      onClick: onHistoryClick,
    },
    {
      ariaLabel: 'Manage tags',
      icon: <Tags size={18} />,
      id: 'tags',
      label: 'Tags',
      onClick: onManageTagsClick,
    },
    {
      icon: <Settings size={18} />,
      id: 'settings',
      label: 'Board settings',
      onClick: onBoardSettingsClick,
    },
  ];

  return (
    <Sidebar
      ariaLabel="Flowboard navigation"
      brand={{
        iconSrc: getThemeIconSrc(resolvedTheme),
        text: 'Flowboard',
      }}
      closeIcon={<X size={18} />}
      closeLabel="Close navigation"
      collapseIcon={<PanelLeftClose size={18} />}
      collapseLabel="Collapse sidebar"
      expandIcon={
        <img
          alt=""
          aria-hidden="true"
          className="app-sidebar__toggle-brand-icon"
          src={getThemeIconSrc(resolvedTheme)}
        />
      }
      expandLabel="Expand sidebar"
      expanded={sidebarExpanded}
      footer={
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
      }
      footerLabel="Theme"
      navAriaLabel="Primary navigation"
      navItems={navItems}
      onClose={onCloseMobileSidebar}
      onToggle={onToggleSidebar}
    />
  );
};

export default AppSidebar;
