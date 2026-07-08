import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import '../ContentDialog/ContentDialog.css';
import '../IconButton/IconButton.css';

type DialogShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  closeLabel?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  popupClassName?: string;
  title: ReactNode;
};

const DialogShell = ({
  actions,
  children,
  closeLabel = 'Close dialog',
  description,
  descriptionClassName,
  onOpenChange,
  open,
  popupClassName,
  title,
}: DialogShellProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop className="dialog-backdrop" />
      <Dialog.Viewport className="dialog-viewport">
        <Dialog.Popup
          className={['dialog-popup', popupClassName].filter(Boolean).join(' ')}
        >
          <div className="dialog-header">
            <div>
              <Dialog.Title className="dialog-title">{title}</Dialog.Title>
              {description && (
                <Dialog.Description
                  className={['dialog-description', descriptionClassName]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label={closeLabel}
              className="icon-button dialog-close"
              render={<Button />}
            >
              <X size={17} />
            </Dialog.Close>
          </div>
          {children}
          {actions && <div className="dialog-actions">{actions}</div>}
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>
);

export default DialogShell;
