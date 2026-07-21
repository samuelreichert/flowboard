import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LocalizationProvider } from '../LocalizationProvider';
import AppSidebar from './AppSidebar';

test('opens the account menu from the keyboard and runs the selected action', async () => {
  const user = userEvent.setup();
  const onSettingsClick = vi.fn();

  render(
    <LocalizationProvider language="en">
      <AppSidebar
        currentView="board"
        onBoardClick={vi.fn()}
        onCloseMobileSidebar={vi.fn()}
        onHistoryClick={vi.fn()}
        onManageColumnsClick={vi.fn()}
        onManageTagsClick={vi.fn()}
        onProfileClick={vi.fn()}
        onSettingsClick={onSettingsClick}
        onSignOut={vi.fn()}
        onToggleSidebar={vi.fn()}
        profile={{
          avatarUrl: null,
          displayName: 'Ada',
          email: 'ada@example.com',
        }}
        resolvedTheme="light"
        sidebarExpanded
        showProfile
        showSignOut
      />
    </LocalizationProvider>
  );

  const trigger = screen.getByRole('button', { name: /open account menu/i });
  trigger.focus();
  await user.keyboard('{Enter}');
  await user.keyboard('{End}{ArrowUp}{Enter}');

  expect(onSettingsClick).toHaveBeenCalledOnce();
});
