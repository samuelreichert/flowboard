import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '@base-ui/react/button';

import { useLocalization } from '../../LocalizationProvider';

type ConfirmDialogProps = {
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  description: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
};

const ConfirmDialog = ({
  confirmLabel,
  confirmVariant = 'danger',
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDialogProps) => {
  const { messages } = useLocalization();

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="dialog-backdrop" />
        <AlertDialog.Viewport className="dialog-viewport">
          <AlertDialog.Popup className="dialog-popup">
            <AlertDialog.Title className="dialog-title">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="dialog-description">
              {description}
            </AlertDialog.Description>
            <div className="dialog-actions">
              <AlertDialog.Close
                className="button button--subtle"
                render={<Button />}
              >
                {messages.common.cancel}
              </AlertDialog.Close>
              <AlertDialog.Close
                className={`button button--${confirmVariant}`}
                onClick={onConfirm}
                render={<Button />}
              >
                {confirmLabel}
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDialog;
