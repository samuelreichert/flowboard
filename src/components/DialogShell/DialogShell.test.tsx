import { render, screen } from '@testing-library/react';

import DialogShell from '.';

type DialogSize = 'compact' | 'default' | 'wide';

const renderDialog = (size?: DialogSize) =>
  render(
    <DialogShell
      onOpenChange={() => undefined}
      open
      size={size}
      title="Example dialog"
    >
      Dialog content
    </DialogShell>
  );

test('uses the defined default dialog width variant', () => {
  renderDialog();

  expect(screen.getByRole('dialog', { name: 'Example dialog' })).toHaveClass(
    'dialog-popup--default'
  );
});

test.each<DialogSize>(['compact', 'wide'])(
  'uses the %s dialog width variant when requested',
  (size) => {
    renderDialog(size);

    expect(screen.getByRole('dialog', { name: 'Example dialog' })).toHaveClass(
      `dialog-popup--${size}`
    );
  }
);
