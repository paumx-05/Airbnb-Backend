interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'message' | 'system' | 'marketing' | 'property' | 'search';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any; // Datos adicionales específicos del tipo
  priority: 'low' | 'medium' | 'high';
}

interface NotificationSettings {
  userId: string;
  email: boolean;
  push: boolean;
  sound: boolean;
  marketing: boolean;
  propertyUpdates: boolean;
  searchAlerts: boolean;
  muteAll: boolean;
}

// Base de datos mock en memoria
const notificationDB = {
  notifications: [] as Notification[],
  settings: [] as NotificationSettings[],
  nextId: 1
};

// Funciones CRUD para notificaciones
export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: notificationDB.nextId.toString(),
    createdAt: new Date().toISOString(),
    priority: notification.priority || 'medium'
  };
  notificationDB.notifications.push(newNotification);
  notificationDB.nextId++;
  return newNotification;
};

export const getUserNotifications = (userId: string, limit: number = 50, type?: string): Notification[] => {
  let notifications = notificationDB.notifications.filter(n => n.userId === userId);
  
  if (type) {
    notifications = notifications.filter(n => n.type === type);
  }
  
  return notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const markNotificationAsRead = (notificationId: string, userId: string): boolean => {
  const notification = notificationDB.notifications.find(n => n.id === notificationId && n.userId === userId);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
};

export const markAllAsRead = (userId: string): number => {
  let count = 0;
  notificationDB.notifications.forEach(notification => {
    if (notification.userId === userId && !notification.isRead) {
      notification.isRead = true;
      count++;
    }
  });
  return count;
};

export const deleteNotification = (notificationId: string, userId: string): boolean => {
  const index = notificationDB.notifications.findIndex(n => n.id === notificationId && n.userId === userId);
  if (index !== -1) {
    notificationDB.notifications.splice(index, 1);
    return true;
  }
  return false;
};

export const clearAllNotifications = (userId: string): number => {
  const initialLength = notificationDB.notifications.length;
  notificationDB.notifications = notificationDB.notifications.filter(n => n.userId !== userId);
  return initialLength - notificationDB.notifications.length;
};

export const getUnreadCount = (userId: string): number => {
  return notificationDB.notifications.filter(n => n.userId === userId && !n.isRead).length;
};

export const updateNotificationSettings = (userId: string, settings: Partial<NotificationSettings>): NotificationSettings => {
  let userSettings = notificationDB.settings.find(s => s.userId === userId);
  
  if (!userSettings) {
    userSettings = {
      userId,
      email: true,
      push: true,
      sound: true,
      marketing: false,
      propertyUpdates: true,
      searchAlerts: true,
      muteAll: false
    };
    notificationDB.settings.push(userSettings);
  }
  
  Object.assign(userSettings, settings);
  return userSettings;
};

export const getNotificationSettings = (userId: string): NotificationSettings => {
  let userSettings = notificationDB.settings.find(s => s.userId === userId);
  
  if (!userSettings) {
    userSettings = {
      userId,
      email: true,
      push: true,
      sound: true,
      marketing: false,
      propertyUpdates: true,
      searchAlerts: true,
      muteAll: false
    };
    notificationDB.settings.push(userSettings);
  }
  
  return userSettings;
};
