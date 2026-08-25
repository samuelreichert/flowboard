import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';

import {
  CARD_CONTENT_SAVE_IDLE_MS,
  useCardContentAutosave,
} from './useCardContentAutosave';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test('flushes only the latest document after a complete idle window', () => {
  vi.useFakeTimers();
  const onFlush = vi.fn();
  const { result } = renderHook(() => useCardContentAutosave({ onFlush }));

  act(() => result.current.queueContentSave('First'));
  act(() => vi.advanceTimersByTime(CARD_CONTENT_SAVE_IDLE_MS - 1));
  expect(onFlush).not.toHaveBeenCalled();

  act(() => result.current.queueContentSave('Latest'));
  act(() => vi.advanceTimersByTime(CARD_CONTENT_SAVE_IDLE_MS - 1));
  expect(onFlush).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(1));
  expect(onFlush).toHaveBeenCalledTimes(1);
  expect(onFlush).toHaveBeenCalledWith('Latest');

  act(() => result.current.queueContentSave('Next burst'));
  act(() => vi.advanceTimersByTime(CARD_CONTENT_SAVE_IDLE_MS));
  expect(onFlush).toHaveBeenNthCalledWith(2, 'Next burst');
});

test('uses the latest flush callback without resubscribing lifecycle effects', () => {
  vi.useFakeTimers();
  const firstOnFlush = vi.fn();
  const latestOnFlush = vi.fn();
  const { rerender, result } = renderHook(
    ({ onFlush }) => useCardContentAutosave({ onFlush }),
    { initialProps: { onFlush: firstOnFlush } }
  );

  act(() => result.current.queueContentSave('Latest callback'));
  rerender({ onFlush: latestOnFlush });
  act(() => vi.advanceTimersByTime(CARD_CONTENT_SAVE_IDLE_MS));

  expect(firstOnFlush).not.toHaveBeenCalled();
  expect(latestOnFlush).toHaveBeenCalledWith('Latest callback');
});

test('flushes a pending document once when the page becomes hidden', () => {
  vi.useFakeTimers();
  const onFlush = vi.fn();
  const visibilityState = vi
    .spyOn(document, 'visibilityState', 'get')
    .mockReturnValue('hidden');
  const { result, unmount } = renderHook(() =>
    useCardContentAutosave({ onFlush })
  );

  act(() => result.current.queueContentSave('Hidden document'));
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(onFlush).toHaveBeenCalledTimes(1);
  expect(onFlush).toHaveBeenCalledWith('Hidden document');

  act(() => document.dispatchEvent(new Event('visibilitychange')));
  act(() => vi.runAllTimers());
  unmount();
  expect(onFlush).toHaveBeenCalledTimes(1);
  visibilityState.mockRestore();
});

test('flushes on explicit exit and does not duplicate during teardown', () => {
  vi.useFakeTimers();
  const onFlush = vi.fn();
  const { result, unmount } = renderHook(() =>
    useCardContentAutosave({ onFlush })
  );

  act(() => result.current.queueContentSave('Leaving editor'));
  act(() => result.current.flushPendingContentSave());
  act(() => result.current.flushPendingContentSave());
  act(() => vi.runAllTimers());
  unmount();

  expect(onFlush).toHaveBeenCalledTimes(1);
  expect(onFlush).toHaveBeenCalledWith('Leaving editor');
});

test('flushes pending content when the producer unmounts', () => {
  vi.useFakeTimers();
  const onFlush = vi.fn();
  const { result, unmount } = renderHook(() =>
    useCardContentAutosave({ onFlush })
  );

  act(() => result.current.queueContentSave('Unmounted editor'));
  unmount();

  expect(onFlush).toHaveBeenCalledTimes(1);
  expect(onFlush).toHaveBeenCalledWith('Unmounted editor');
});
