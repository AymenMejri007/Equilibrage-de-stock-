import { toast } from 'sonner';

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  toast.error(message);
};

export const showInfoToast = (message: string) => {
  toast.info(message);
};

export const showWarningToast = (message: string) => {
  toast.warning(message);
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

export const updateToast = (toastId: string | number, options: { type: 'success' | 'error' | 'info' | 'warning', message: string }) => {
  if (options.type === 'success') {
    toast.success(options.message, { id: toastId });
  } else if (options.type === 'error') {
    toast.error(options.message, { id: toastId });
  } else if (options.type === 'info') {
    toast.info(options.message, { id: toastId });
  } else if (options.type === 'warning') {
    toast.warning(options.message, { id: toastId });
  }
};