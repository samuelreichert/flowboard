import { expect, test } from 'vitest';

import { normalizeTaskListMarkerLines } from './index';

test('joins standalone task markers with the following text line', () => {
  expect(
    normalizeTaskListMarkerLines(
      [
        '- [ ]',
        'Find the structure with screenshots for the PDF DocGen',
        '- [ ]',
        'Answer his question on where does it is published?',
      ].join('\n')
    )
  ).toBe(
    [
      '- [ ] Find the structure with screenshots for the PDF DocGen',
      '- [ ] Answer his question on where does it is published?',
    ].join('\n')
  );
});

test('keeps standalone task markers before another markdown block', () => {
  expect(
    normalizeTaskListMarkerLines(['- [ ]', '- [ ] Next task'].join('\n'))
  ).toBe(['- [ ]', '- [ ] Next task'].join('\n'));
});
