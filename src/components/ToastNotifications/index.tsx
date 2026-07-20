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
import type { Messages } from '../../localization';

import './ToastNotifications.css';

export type ToastNotificationVariant = 'error' | 'info' | 'success' | 'warning';

type ToastNotificationOptions = {
  description?: ReactNode;
  id?: string;
  persistent?: boolean;
  title: ReactNode;
  variant: ToastNotificationVariant;
};

export const TOAST_IDS = {
  boardLoad: 'board-load',
  boardMutationError: 'board-mutation-error',
  boardSave: 'board-save',
  boardUnavailable: 'board-unavailable',
} as const;

const TOAST_TIMEOUT = 5_000;
const toastManager = Toast.createToastManager();
let toastViewportReady = false;
let queuedToasts: ToastNotificationOptions[] = [];

type AppToastMessages = Pick<Messages['app'], 'persistence' | 'toast'>;

const toastIconByVariant = {
  error: CircleAlert,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
} as const;

const addToast = ({
  description,
  id,
  persistent = false,
  title,
  variant,
}: ToastNotificationOptions) =>
  toastManager.add({
    description,
    id,
    priority: variant === 'error' ? 'high' : 'low',
    timeout: persistent ? 0 : TOAST_TIMEOUT,
    title,
    type: variant,
  });

export const notify = (options: ToastNotificationOptions) => {
  if (!toastViewportReady) {
    if (options.id) {
      queuedToasts = [
        ...queuedToasts.filter((toast) => toast.id !== options.id),
        options,
      ];
    } else {
      queuedToasts = [...queuedToasts, options];
    }

    return options.id ?? '';
  }

  return addToast(options);
};

export const dismissToast = (id?: string) => {
  if (!toastViewportReady) {
    queuedToasts = id
      ? queuedToasts.filter((toast) => toast.id !== id)
      : [];
    return;
  }

  toastManager.close(id);
};

export const notifyBoardLoading = (messages: AppToastMessages) =>
  notify({
    id: TOAST_IDS.boardLoad,
    title: messages.toast.loadingBoard,
    variant: 'info',
  });

export const notifyBoardSaving = (messages: AppToastMessages) =>
  notify({
    id: TOAST_IDS.boardSave,
    title: messages.toast.savingChanges,
    variant: 'info',
  });

export const notifyBoardUnavailable = (messages: AppToastMessages) =>
  notify({
    description: messages.persistence.boardUnavailable,
    id: TOAST_IDS.boardUnavailable,
    persistent: true,
    title: messages.toast.boardUnavailable,
    variant: 'error',
  });

export const notifyPersistenceFailure = (messages: AppToastMessages) =>
  notify({
    description: messages.persistence.unsaved,
    id: TOAST_IDS.boardMutationError,
    persistent: true,
    title: messages.toast.changesNotSaved,
    variant: 'error',
  });

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

      toastViewportReady = true;
      const pendingToasts = queuedToasts;

      queuedToasts = [];
      pendingToasts.forEach(addToast);
    });

    return () => {
      active = false;
      toastViewportReady = false;
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
