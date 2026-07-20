import { Toast } from '@base-ui/react/toast';
import type { ReactNode } from 'react';

import type { Messages } from '../../localization';

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
export const toastManager = Toast.createToastManager();
let toastViewportReady = false;
let queuedToasts: ToastNotificationOptions[] = [];

type AppToastMessages = Pick<Messages['app'], 'persistence' | 'toast'>;

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
    queuedToasts = id ? queuedToasts.filter((toast) => toast.id !== id) : [];
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

export const activateToastViewport = () => {
  toastViewportReady = true;
  const pendingToasts = queuedToasts;

  queuedToasts = [];
  pendingToasts.forEach(addToast);
};

export const deactivateToastViewport = () => {
  toastViewportReady = false;
};
