import { Button } from '@base-ui/react/button';
import { Menu } from '@base-ui/react/menu';
import {
  ChevronRight,
  Columns3,
  History,
  KanbanSquare,
  LogOut,
  PanelLeftClose,
  Settings,
  Tags,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useLocalization } from '../LocalizationProvider';
import {
  getProfileDisplayName,
  getProfileSubtitle,
  type ProfileIdentity,
} from '../auth/profileDisplay';
import ProfileAvatar from '../components/ProfileAvatar';
import Sidebar from '../components/Sidebar';
import type { SidebarNavItem } from '../components/Sidebar';
import type { ResolvedTheme } from '../theme';
import { getThemeIconSrc } from './appTheme';
import type { AppView } from './appTypes';

import './AppSidebar.css';

type AppSidebarProps = {
  className?: string;
  currentView: AppView;
  onBoardClick: () => void;
  onCloseMobileSidebar: () => void;
  onHistoryClick: () => void;
  onManageColumnsClick: () => void;
  onManageTagsClick: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onSignOut: () => void;
  onToggleSidebar: () => void;
  profile: ProfileIdentity | null;
  resolvedTheme: ResolvedTheme;
  sidebarExpanded: boolean;
  showProfile: boolean;
  showSignOut: boolean;
};

const AppSidebar = ({
  className,
  currentView,
  onBoardClick,
  onCloseMobileSidebar,
  onHistoryClick,
  onManageColumnsClick,
  onManageTagsClick,
  onProfileClick,
  onSettingsClick,
  onSignOut,
  onToggleSidebar,
  profile,
  resolvedTheme,
  sidebarExpanded,
  showProfile,
  showSignOut,
}: AppSidebarProps) => {
  const { messages } = useLocalization();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navItems: SidebarNavItem[] = [
    {
      active: currentView === 'board',
      icon: <KanbanSquare size={18} />,
      id: 'board',
      label: messages.app.navigation.board,
      onClick: onBoardClick,
    },
    {
      active: currentView === 'history',
      icon: <History size={18} />,
      id: 'history',
      label: messages.app.navigation.history,
      onClick: onHistoryClick,
    },
    {
      ariaLabel: messages.app.navigation.manageColumns,
      icon: <Columns3 size={18} />,
      id: 'columns',
      label: messages.app.navigation.columns,
      onClick: onManageColumnsClick,
    },
    {
      ariaLabel: messages.app.navigation.manageTags,
      icon: <Tags size={18} />,
      id: 'tags',
      label: messages.app.navigation.tags,
      onClick: onManageTagsClick,
    },
  ];
  const displayName = getProfileDisplayName(profile);
  const subtitle = getProfileSubtitle(profile);
  const opensSettingsDirectly = !showProfile && !showSignOut;
  return (
    <Sidebar
      ariaLabel={messages.app.navigation.flowboardNavigation}
      brand={{
        iconSrc: getThemeIconSrc(resolvedTheme),
        text: 'Flowboard',
      }}
      className={className}
      closeIcon={<X size={18} />}
      closeLabel={messages.app.navigation.closeNavigation}
      collapseIcon={<PanelLeftClose size={18} />}
      collapseLabel={messages.app.navigation.collapseSidebar}
      expandIcon={
        <img
          alt=""
          aria-hidden="true"
          className="app-sidebar__toggle-brand-icon"
          src={getThemeIconSrc(resolvedTheme)}
        />
      }
      expandLabel={messages.app.navigation.expandSidebar}
      expanded={sidebarExpanded}
      footer={
        opensSettingsDirectly ? (
          <Button
            aria-label={messages.app.navigation.settings}
            className="app-sidebar__account-trigger"
            onClick={onSettingsClick}
            title={displayName}
            type="button"
          >
            <ProfileAvatar profile={profile} size="sm" />
            <span className="app-sidebar__account-text">
              <span className="app-sidebar__account-name">{displayName}</span>
              <span className="app-sidebar__account-email">{subtitle}</span>
            </span>
          </Button>
        ) : (
          <Menu.Root open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
            <Menu.Trigger
              aria-label={messages.app.navigation.openAccountMenu}
              className="app-sidebar__account-trigger"
              render={<Button />}
              title={displayName}
            >
              <ProfileAvatar profile={profile} size="sm" />
              <span className="app-sidebar__account-text">
                <span className="app-sidebar__account-name">{displayName}</span>
                <span className="app-sidebar__account-email">{subtitle}</span>
              </span>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                align="start"
                className="app-sidebar__account-menu-positioner"
                side="top"
                sideOffset={8}
              >
                <Menu.Popup className="menu-popup app-sidebar__account-menu">
                  {showProfile && (
                    <>
                      <Menu.Item
                        className="menu-item app-sidebar__account-menu-profile"
                        onClick={onProfileClick}
                      >
                        <ProfileAvatar profile={profile} size="sm" />
                        <span className="app-sidebar__account-text">
                          <span className="app-sidebar__account-name">
                            {displayName}
                          </span>
                          <span className="app-sidebar__account-email">
                            {subtitle}
                          </span>
                        </span>
                        <ChevronRight size={16} />
                      </Menu.Item>
                      <Menu.Separator className="menu-separator" />
                    </>
                  )}
                  <Menu.Item
                    className="menu-item"
                    onClick={onSettingsClick}
                  >
                    <Settings size={15} />
                    {messages.app.navigation.settings}
                  </Menu.Item>
                  {showSignOut && (
                    <Menu.Item
                      className="menu-item menu-item--danger"
                      onClick={onSignOut}
                    >
                      <LogOut size={15} />
                      {messages.app.navigation.signOut}
                    </Menu.Item>
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        )
      }
      navAriaLabel={messages.app.navigation.primaryNavigation}
      navItems={navItems}
      onClose={onCloseMobileSidebar}
      onToggle={onToggleSidebar}
    />
  );
};

export default AppSidebar;
