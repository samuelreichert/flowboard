import '@testing-library/jest-dom/vitest';

document.elementFromPoint ??= () => document.body;

const createClientRects = (rect: DOMRect) =>
  ({
    0: rect,
    item: (index: number) => (index === 0 ? rect : null),
    length: 1,
    [Symbol.iterator]: function* iterator() {
      yield rect;
    },
  }) as DOMRectList;

const createRect = () =>
  ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

Element.prototype.getClientRects ??= function getClientRects() {
  return createClientRects(this.getBoundingClientRect());
};

Element.prototype.getBoundingClientRect ??= createRect;

Range.prototype.getClientRects ??= function getClientRects() {
  return createClientRects(createRect());
};

Range.prototype.getBoundingClientRect ??= createRect;

Object.defineProperty(Text.prototype, 'getClientRects', {
  configurable: true,
  value: function getClientRects() {
    return createClientRects(createRect());
  },
});

Object.defineProperty(Text.prototype, 'getBoundingClientRect', {
  configurable: true,
  value: createRect,
});
