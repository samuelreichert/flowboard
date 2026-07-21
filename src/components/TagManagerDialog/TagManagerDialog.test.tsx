import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';

import App from '../../App';
import { fetchTagStorage } from '../../storage';
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
} from '../../test/appTestUtils';

beforeEach(resetAppTestEnvironment);

test('manages board tags from the sidebar', async () => {
  const user = userEvent.setup();
  render(<App />);
  const fetchMock = vi.mocked(fetch);

  fetchMock.mockClear();
  await openTagManager(user);
  await user.type(screen.getByLabelText('New tag'), 'Bug{Enter}');
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).endsWith('/api/board/tags') && init?.method === 'POST'
      )
    ).toBe(true)
  );
  expect(fetchTagStorage()[0].name).toBe('Bug');

  await user.click(screen.getByRole('button', { name: /rename bug tag/i }));
  await user.clear(screen.getByLabelText('Edit Bug tag'));
  await user.type(screen.getByLabelText('Edit Bug tag'), 'Issue');
  await user.click(screen.getByLabelText('New tag'));
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: /rename issue tag/i })
    ).toBeInTheDocument()
  );
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).includes('/api/board/tags/') && init?.method === 'PATCH'
      )
    ).toBe(true)
  );
  expect(fetchTagStorage()[0].name).toBe('Issue');

  await user.click(screen.getByRole('button', { name: /remove issue tag/i }));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).includes('/api/board/tags/') && init?.method === 'DELETE'
      )
    ).toBe(true)
  );
  expect(fetchTagStorage()).toEqual([]);
  expect(
    fetchMock.mock.calls.some(
      ([url, init]) => String(url).includes('/api/boards/') && init?.method === 'PUT'
    )
  ).toBe(false);
});

test('confirms removing tags that are assigned to cards', async () => {
  const user = userEvent.setup();
  render(<App />);

  await addColumn(user, 'Todo');
  await addCard(user, 'Todo', 'Tagged');
  await user.click(screen.getByText('Tagged'));
  const cardDialog = await screen.findByRole('dialog', { name: /card/i });
  await user.click(
    within(cardDialog).getByRole('combobox', { name: /tags/i })
  );
  await user.click(screen.getByRole('button', { name: /create tag/i }));
  await user.type(screen.getByLabelText('New tag name'), 'Design{Enter}');
  await waitFor(() =>
    expect(fetchTagStorage().map((tag) => tag.name)).toEqual(['Design'])
  );
  await user.click(await screen.findByRole('button', { name: /close card/i }));

  await openTagManager(user);
  await user.click(screen.getByRole('button', { name: /remove design tag/i }));
  expect(
    await screen.findByRole('alertdialog', { name: /remove this tag/i })
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /^remove tag$/i }));

  expect(fetchTagStorage()).toEqual([]);
  expect(readColumns()[0].cards[0].tagIds).toEqual([]);
});
