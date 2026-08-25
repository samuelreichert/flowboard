import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { LocalizationProvider } from '../../LocalizationProvider';
import type { BoardCard, BoardColumn, BoardTag } from '../../types';
import { CARD_CONTENT_SAVE_IDLE_MS } from './useCardContentAutosave';
import useCardDialogController from './useCardDialogController';

const card: BoardCard = {
  content: 'Initial content',
  createdAt: '2026-08-05T07:00:00.000Z',
  id: 'card-1',
  priority: 'medium',
  tagIds: [],
  title: 'Initial title',
};
const tags: BoardTag[] = [{ id: 'tag-1', name: 'Design' }];
const columns: BoardColumn[] = [
  { cards: [card], id: 'todo', position: 0, title: 'Todo' },
  { cards: [], id: 'done', position: 10, title: 'Done' },
];
const wrapper = ({ children }: PropsWithChildren) => (
  <LocalizationProvider language="en">{children}</LocalizationProvider>
);

const renderController = () => {
  const onDelete = vi.fn();
  const onOpenChange = vi.fn();
  const onSave = vi.fn();
  const onTagsChange = vi.fn();
  const hook = renderHook(
    () =>
      useCardDialogController({
        card,
        columnId: 'todo',
        columns,
        onDelete,
        onOpenChange,
        onSave,
        onTagsChange,
        open: true,
        tags,
      }),
    { wrapper }
  );

  return { ...hook, onDelete, onOpenChange, onSave, onTagsChange };
};

afterEach(() => {
  vi.useRealTimers();
});

test('keeps metadata saves immediate while rich content remains pending', () => {
  vi.useFakeTimers();
  const { onSave, result } = renderController();

  act(() => result.current.onContentChange('Latest content'));
  expect(result.current.content).toBe('Latest content');
  expect(onSave).not.toHaveBeenCalled();

  act(() => result.current.onPriorityChange('high'));
  expect(onSave).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      changedFields: { priority: 'high' },
      content: 'Latest content',
    })
  );

  act(() => result.current.onColumnChange('done'));
  expect(onSave).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ changedFields: { columnId: 'done' } })
  );

  act(() => result.current.onSelectedTagIdsChange(['tag-1']));
  expect(onSave).toHaveBeenNthCalledWith(
    3,
    expect.objectContaining({ changedFields: { tagIds: ['tag-1'] } })
  );

  act(() => result.current.onTitleChange('Renamed'));
  expect(onSave).toHaveBeenCalledTimes(3);
  act(() => result.current.onTitleBlur());
  expect(onSave).toHaveBeenNthCalledWith(
    4,
    expect.objectContaining({ changedFields: { title: 'Renamed' } })
  );

  act(() => result.current.onContentBlur());
  expect(onSave).toHaveBeenNthCalledWith(
    5,
    expect.objectContaining({
      changedFields: { content: 'Latest content' },
      columnId: 'done',
      priority: 'high',
      tagIds: ['tag-1'],
      title: 'Renamed',
    })
  );

  act(() => vi.runAllTimers());
  expect(onSave).toHaveBeenCalledTimes(5);
});

test('piggybacks a valid dirty title only when pending content flushes', () => {
  vi.useFakeTimers();
  const { onSave, result } = renderController();

  act(() => result.current.onTitleChange('Renamed'));
  act(() => result.current.onContentChange('Latest content'));
  expect(onSave).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(CARD_CONTENT_SAVE_IDLE_MS));
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      changedFields: {
        content: 'Latest content',
        title: 'Renamed',
      },
    })
  );
});

test('flushes pending content before closing the card dialog', () => {
  vi.useFakeTimers();
  const { onOpenChange, onSave, result } = renderController();

  act(() => result.current.onContentChange('Close flush'));
  act(() => result.current.onCardOpenChange(false));

  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ changedFields: { content: 'Close flush' } })
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(onSave.mock.invocationCallOrder[0]).toBeLessThan(
    onOpenChange.mock.invocationCallOrder[0]
  );

  act(() => vi.runAllTimers());
  expect(onSave).toHaveBeenCalledTimes(1);
});
