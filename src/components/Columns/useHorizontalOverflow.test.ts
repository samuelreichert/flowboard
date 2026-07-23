import { describe, expect, test } from 'vitest';

import {
  getHorizontalWheelDelta,
  hasHorizontalOverflow,
  scrollByHorizontalInput,
} from './useHorizontalOverflow';

describe('hasHorizontalOverflow', () => {
  test('only enables the right-edge affordance when the board exceeds its viewport', () => {
    expect(hasHorizontalOverflow({ clientWidth: 300, scrollWidth: 301 })).toBe(
      true
    );
    expect(hasHorizontalOverflow({ clientWidth: 300, scrollWidth: 300 })).toBe(
      false
    );
  });
});

describe('horizontal input', () => {
  test('keeps a plain mouse wheel vertical while accepting Shift+wheel and horizontal touchpad gestures', () => {
    expect(
      getHorizontalWheelDelta({ deltaX: 0, deltaY: 60, shiftKey: false })
    ).toBe(0);
    expect(
      getHorizontalWheelDelta({ deltaX: 0, deltaY: 60, shiftKey: true })
    ).toBe(60);
    expect(
      getHorizontalWheelDelta({ deltaX: 60, deltaY: 0, shiftKey: true })
    ).toBe(60);
    expect(
      getHorizontalWheelDelta({ deltaX: 60, deltaY: 12, shiftKey: false })
    ).toBe(60);
  });

  test('moves a board only when the horizontal input has room to travel', () => {
    const columnsList = { clientWidth: 300, scrollLeft: 100, scrollWidth: 900 };

    expect(scrollByHorizontalInput(columnsList, 80)).toBe(true);
    expect(columnsList.scrollLeft).toBe(180);
    expect(scrollByHorizontalInput(columnsList, -500)).toBe(true);
    expect(columnsList.scrollLeft).toBe(0);
    expect(scrollByHorizontalInput(columnsList, -80)).toBe(false);
  });
});
