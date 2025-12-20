// This file exports utility functions for handling notifications
// The useSocket hook is imported in components that need it directly

export const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  // In a real app, this would integrate with a notification system
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // For now, we'll just show an alert (in a real app, you'd use a proper notification component)
  switch (type) {
    case 'success':
      console.info(message);
      break;
    case 'error':
      console.error(message);
      break;
    case 'warning':
      console.warn(message);
      break;
    default:
      console.log(message);
  }
};

export const showSuccessNotification = (message: string) => {
  showNotification(message, 'success');
};

export const showErrorNotification = (message: string) => {
  showNotification(message, 'error');
};

export const showInfoNotification = (message: string) => {
  showNotification(message, 'info');
};

export const showWarningNotification = (message: string) => {
  showNotification(message, 'warning');
};