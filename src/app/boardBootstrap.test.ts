import { describe, expect, test } from 'vitest';

import {
  BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER,
  createBoardStateFromBootstrap,
} from './boardBootstrap';
import type { BoardBootstrapResponse } from '../storage/authenticatedApi';

const bootstrap: BoardBootstrapResponse = {
  board: {
    background: {
      type: 'color',
      value: '#ffffff',
    },
    id: 'board-1',
    title: 'Flowboard',
    version: 3,
  },
  cards: [
    {
      columnId: 'todo',
      id: 'card-1',
      priority: 'high',
      tagIds: ['tag-1'],
      title: 'Lean card',
    },
  ],
  columns: [
    {
      id: 'todo',
      title: 'Todo',
    },
  ],
  tags: [
    {
      id: 'tag-1',
      name: 'Backend',
    },
  ],
  workCycle: {
    completedColumnId: 'todo',
    startDate: '2026-07-17T10:00:00.000Z',
  },
};

describe('createBoardStateFromBootstrap', () => {
  test('adapts lean bootstrap into board surface state without rich content or history', () => {
    expect(createBoardStateFromBootstrap(bootstrap)).toEqual({
      activeWorkCycle: bootstrap.workCycle,
      background: bootstrap.board.background,
      columns: [
        {
          cards: [
            {
              content: '',
              createdAt: BOOTSTRAP_CARD_CREATED_AT_PLACEHOLDER,
              id: 'card-1',
              priority: 'high',
              tagIds: ['tag-1'],
              title: 'Lean card',
            },
          ],
          id: 'todo',
          position: 0,
          title: 'Todo',
        },
      ],
      completedWorkCycles: [],
      tags: bootstrap.tags,
    });
  });
});
