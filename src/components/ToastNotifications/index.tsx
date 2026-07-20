import { Toast } from '@base-ui/react/toast';
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { useLocalization } from '../../LocalizationProvider';
import {
  activateToastViewport,
  deactivateToastViewport,
  toastManager,
  type ToastNotificationVariant,
} from './toastNotifications';

import './ToastNotifications.css';

const toastIconByVariant = {
  error: CircleAlert,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
} as const;

type ToastViewportProps = {
  children: ReactNode;
};

const ToastManagerActivation = () => {
  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      activateToastViewport();
    });

    return () => {
      active = false;
      deactivateToastViewport();
    };
  }, []);

  return null;
};

const ToastViewport = ({ children }: ToastViewportProps) => {
  const { messages } = useLocalization();
  const { toasts } = Toast.useToastManager();

  return (
    <>
      {children}
      <Toast.Portal>
        <Toast.Viewport
          aria-label={messages.app.toast.notifications}
          className="toast-viewport"
        >
          {toasts.map((toast) => {
            const variant =
              (toast.type as ToastNotificationVariant | undefined) ?? 'info';
            const Icon = toastIconByVariant[variant];

            return (
              <Toast.Root
                className="toast-notification"
                key={toast.id}
                toast={toast}
              >
                <Toast.Content className="toast-notification__content">
                  <Icon
                    aria-hidden="true"
                    className="toast-notification__icon"
                    size={18}
                  />
                  <div className="toast-notification__copy">
                    <Toast.Title className="toast-notification__title">
                      {toast.title}
                    </Toast.Title>
                    {toast.description ? (
                      <Toast.Description className="toast-notification__description">
                        {toast.description}
                      </Toast.Description>
                    ) : null}
                  </div>
                  <Toast.Close
                    aria-label={messages.app.toast.dismiss}
                    className="toast-notification__close"
                    title={messages.app.toast.dismiss}
                  >
                    <X aria-hidden="true" size={16} />
                  </Toast.Close>
                </Toast.Content>
              </Toast.Root>
            );
          })}
        </Toast.Viewport>
      </Toast.Portal>
    </>
  );
};

export const FlowboardToastProvider = ({ children }: ToastViewportProps) => (
  <Toast.Provider limit={3} toastManager={toastManager}>
    <ToastManagerActivation />
    <ToastViewport>{children}</ToastViewport>
  </Toast.Provider>
);
