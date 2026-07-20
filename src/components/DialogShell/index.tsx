import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

import '../ContentDialog/ContentDialog.css';
import '../IconButton/IconButton.css';

type DialogShellProps = {
  actions?: ReactNode;
  actionsClassName?: string;
  children: ReactNode;
  closeLabel?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  popupClassName?: string;
  title: ReactNode;
  viewportRef?: Ref<HTMLDivElement>;
};

const DialogShell = ({
  actions,
  actionsClassName,
  children,
  closeLabel = 'Close dialog',
  description,
  descriptionClassName,
  onOpenChange,
  open,
  popupClassName,
  title,
  viewportRef,
}: DialogShellProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop className="dialog-backdrop" />
      <Dialog.Viewport className="dialog-viewport" ref={viewportRef}>
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
          {actions && (
            <div
              className={['dialog-actions', actionsClassName]
                .filter(Boolean)
                .join(' ')}
            >
              {actions}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>
);

export default DialogShell;
