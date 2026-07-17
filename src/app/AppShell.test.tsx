import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import App from '../App';
import {
  CREATED_AT,
  addCard,
  addColumn,
  chooseSelectOption,
  closeCardDialog,
  createBoardColumns,
  createBoardStateWithHistory,
  expectCardDialogTitle,
  getBoardCardButton,
  openBoardSettings,
  openColumnActions,
  openTagManager,
  pasteText,
  readColumns,
  resetAppTestEnvironment,
  selectEditorContents,
  selectEditorNode,
  selectText,
} from '../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('collapses and expands the desktop sidebar', async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole('main')).toHaveClass('app--sidebar-expanded');

  await user.click(screen.getByRole('button', { name: /collapse sidebar/i }));
  expect(screen.getByRole('main')).toHaveClass('app--sidebar-collapsed');
  expect(screen.getByRole('button', { name: /^board$/i })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /expand sidebar/i }));
  expect(screen.getByRole('main')).toHaveClass('app--sidebar-expanded');
});

test('opens and closes the mobile navigation drawer', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: /open navigation/i }));
  expect(screen.getByRole('main')).toHaveClass('app--mobile-sidebar-open');

  await user.click(
    screen.getAllByRole('button', { name: /close navigation/i })[0]
  );
  expect(screen.getByRole('main')).not.toHaveClass('app--mobile-sidebar-open');
});

test('changes and persists the app theme preference from settings', async () => {
  const user = userEvent.setup();
  render(<App />);

  await openBoardSettings(user);
  await user.click(screen.getByRole('button', { name: /use dark theme/i }));
  const appShell = document.querySelector('main');

  expect(appShell).toHaveAttribute('data-theme', 'dark');
  expect(appShell).toHaveAttribute('data-theme-preference', 'dark');
  expect(
    screen.getByRole('group', { name: /theme preference/i })
  ).toHaveAttribute('data-selected-value', 'dark');
  expect(
    document.querySelector<HTMLImageElement>('.app-sidebar__brand-icon')?.src
  ).toMatch(/\/icon-dark\.svg$/);
  expect(
    document.querySelector<HTMLLinkElement>('#flowboard-favicon')?.href
  ).toMatch(/\/icon-dark\.svg$/);
  expect(localStorage.getItem('flowboardThemePreference')).toBe('dark');
});

test('uses Brazilian Portuguese automatically from the browser language', () => {
  Object.defineProperty(navigator, 'languages', {
    configurable: true,
    value: ['pt-BR', 'en-US'],
  });

  render(<App />);

  expect(
    screen.getByRole('complementary', { name: /navegação do flowboard/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /quadro/i })).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute('lang', 'pt-BR');
});

test('changes and persists the local language preference from settings', async () => {
  Object.defineProperty(navigator, 'languages', {
    configurable: true,
    value: ['pt-PT', 'en-US'],
  });

  const user = userEvent.setup();
  const { unmount } = render(<App />);

  expect(screen.getByRole('heading', { name: /quadro/i })).toBeInTheDocument();

  await openBoardSettings(user);
  expect(
    screen.getByRole('combobox', { name: /preferência de idioma/i })
  ).toHaveTextContent('Idioma do navegador (Português (Brasil))');

  await chooseSelectOption(user, 'Preferência de idioma', 'English');

  expect(screen.getByRole('heading', { name: /board/i })).toBeInTheDocument();
  expect(localStorage.getItem('flowboardLanguagePreference')).toBe('en');
  expect(document.documentElement).toHaveAttribute('lang', 'en');

  unmount();
  render(<App />);

  expect(screen.getByRole('heading', { name: /board/i })).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute('lang', 'en');
});

test('ignores legacy saved background values for the visible app shell', () => {
  localStorage.setItem(
    'boardBackground',
    JSON.stringify({
      type: 'image',
      value: '/flowboard-background.png',
    })
  );

  render(<App />);

  expect(screen.getByRole('main')).not.toHaveClass('app--image-background');
  expect(screen.getByRole('main').style.backgroundImage).toBe('');
  expect(
    screen.queryByRole('menuitem', { name: /background settings/i })
  ).not.toBeInTheDocument();
});

test('board actions live in the sidebar and the top-right menu is removed', () => {
  render(<App />);

  expect(
    screen.getByRole('button', { name: /manage tags/i })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /open board actions/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /background settings/i })
  ).not.toBeInTheDocument();
});
