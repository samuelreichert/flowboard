import { describe, expect, test } from 'vitest';

import { BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER } from './boardBootstrap';
import {
  mergeBoardSurfaceIntoCompleteState,
  needsCompleteBoardSnapshotForSave,
} from './boardSaveSafety';
import type { BoardState } from '../types';

const completeState: BoardState = {
  activeWorkCycle: {
    completedColumnId: 'done',
    startDate: '2026-07-01T10:00:00.000Z',
  },
  background: {
    type: 'color',
    value: '#ffffff',
  },
  columns: [
    {
      cards: [
        {
          content: 'Rich content',
          createdAt: '2026-07-10T10:00:00.000Z',
          id: 'card-1',
          priority: 'medium',
          tagIds: [],
          title: 'Original title',
        },
      ],
      id: 'todo',
      position: 0,
      title: 'Todo',
    },
  ],
  completedWorkCycles: [
    {
      cards: [],
      completedColumnId: 'done',
      completedColumnTitle: 'Done',
      endDate: '2026-07-15T10:00:00.000Z',
      id: 'cycle-1',
      startDate: '2026-07-01T10:00:00.000Z',
    },
  ],
  tags: [],
};

describe('board save safety', () => {
  test('detects summary-backed cards that need a complete snapshot', () => {
    const summaryState: BoardState = {
      ...completeState,
      columns: [
        {
          ...completeState.columns[0],
          cards: [
            {
              content: '',
              createdAt: BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER,
              id: 'card-1',
              priority: 'high',
              tagIds: ['tag-1'],
              title: 'Edited title',
            },
          ],
        },
      ],
      completedWorkCycles: [],
    };

    expect(needsCompleteBoardSnapshotForSave(summaryState)).toBe(true);
  });

  test('merges surface edits without wiping rich content or history', () => {
    const summaryState: BoardState = {
      ...completeState,
      columns: [
        {
          ...completeState.columns[0],
          cards: [
            {
              content: '',
              createdAt: BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER,
              id: 'card-1',
              priority: 'high',
              tagIds: ['tag-1'],
              title: 'Edited title',
            },
          ],
        },
      ],
      completedWorkCycles: [],
      tags: [{ id: 'tag-1', name: 'Backend' }],
    };

    expect(mergeBoardSurfaceIntoCompleteState(summaryState, completeState))
      .toMatchObject({
        columns: [
          {
            cards: [
              {
                content: 'Rich content',
                createdAt: '2026-07-10T10:00:00.000Z',
                priority: 'high',
                tagIds: ['tag-1'],
                title: 'Edited title',
              },
            ],
          },
        ],
        completedWorkCycles: completeState.completedWorkCycles,
        tags: [{ id: 'tag-1', name: 'Backend' }],
      });
  });
});
