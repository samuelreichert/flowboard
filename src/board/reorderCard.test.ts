import { expect, test } from 'vitest';

import { reorderCard } from './commands';
import { createBoardColumns } from '../test/appTestUtils';

test('reorders cards upward and downward in the same column', () => {
  const columns = createBoardColumns();

  const movedUp = reorderCard(columns, {
    cardId: 'third',
    closestEdge: 'top',
    fromColumnId: 'todo',
    targetCardId: 'first',
    toColumnId: 'todo',
  });
  expect(movedUp[0].cards.map((card) => card.id)).toEqual([
    'third',
    'first',
    'second',
  ]);

  const movedDown = reorderCard(movedUp, {
    cardId: 'third',
    closestEdge: 'bottom',
    fromColumnId: 'todo',
    targetCardId: 'second',
    toColumnId: 'todo',
  });
  expect(movedDown[0].cards.map((card) => card.id)).toEqual([
    'first',
    'second',
    'third',
  ]);
});

test('moves a card to a precise position in another column', () => {
  const columns = createBoardColumns();
  const moved = reorderCard(columns, {
    cardId: 'second',
    closestEdge: 'top',
    fromColumnId: 'todo',
    targetCardId: 'done',
    toColumnId: 'complete',
  });

  expect(moved[0].cards.map((card) => card.id)).toEqual(['first', 'third']);
  expect(moved[1].cards.map((card) => card.id)).toEqual(['second', 'done']);
});
