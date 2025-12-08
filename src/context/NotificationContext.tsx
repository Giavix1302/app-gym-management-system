import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification from '../components/Notification';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    title: string,
    duration?: number
  ) => void;
  success: (title: string) => void;
  error: (title: string) => void;
  warning: (title: string) => void;
  info: (title: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within NotificationProvider'
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = (
    type: NotificationType,
    title: string,
    duration: number = 3000
  ) => {
    const id = Date.now().toString();
    const newNotification: NotificationData = {
      id,
      type,
      title,
      duration,
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const success = (title: string) => {
    showNotification('success', title);
  };

  const error = (title: string) => {
    showNotification('error', title);
  };

  const warning = (title: string) => {
    showNotification('warning', title);
  };

  const info = (title: string) => {
    showNotification('info', title);
  };

  return (
    <NotificationContext.Provider
      value={{ showNotification, success, error, warning, info }}
    >
      {children}
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          type={notif.type}
          title={notif.title}
          duration={notif.duration}
          onHide={() => hideNotification(notif.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};
