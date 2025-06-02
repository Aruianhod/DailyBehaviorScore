import { useState } from 'react';

export interface UseDialogReturn {
  // Alert dialog
  showAlert: (message: string, title?: string, type?: 'success' | 'error' | 'warning' | 'info') => Promise<void>;
  alertState: {
    isOpen: boolean;
    message: string;
    title?: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  closeAlert: () => void;

  // Confirm dialog
  showConfirm: (message: string, title?: string, type?: 'danger' | 'warning' | 'info') => Promise<boolean>;
  confirmState: {
    isOpen: boolean;
    message: string;
    title?: string;
    type: 'danger' | 'warning' | 'info';
  };
  closeConfirm: (result: boolean) => void;
}

export const useDialog = (): UseDialogReturn => {
  // Alert state
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: '',
    title: undefined as string | undefined,
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });
  const [alertResolver, setAlertResolver] = useState<(() => void) | null>(null);

  // Confirm state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: undefined as string | undefined,
    type: 'info' as 'danger' | 'warning' | 'info'
  });
  const [confirmResolver, setConfirmResolver] = useState<((result: boolean) => void) | null>(null);

  const showAlert = (message: string, title?: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        message: message || '',
        title,
        type
      });
      setAlertResolver(() => resolve);
    });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
    if (alertResolver) {
      alertResolver();
      setAlertResolver(null);
    }
  };

  const showConfirm = (message: string, title?: string, type: 'danger' | 'warning' | 'info' = 'info'): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message: message || '',
        title,
        type
      });
      setConfirmResolver(() => resolve);
    });
  };

  const closeConfirm = (result: boolean) => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    if (confirmResolver) {
      confirmResolver(result);
      setConfirmResolver(null);
    }
  };

  return {
    showAlert,
    alertState,
    closeAlert,
    showConfirm,
    confirmState,
    closeConfirm
  };
};
