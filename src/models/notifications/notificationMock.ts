/**
 * 🔔 MODELO MOCK DE NOTIFICACIONES
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para sistema de notificaciones. Maneja notificaciones de usuarios
 * y configuraciones básicas. Incluye diferentes tipos de notificaciones con seguimiento
 * de estado de lectura.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - Notification: Interfaz de notificación (definida en types/)
 * - NotificationSettings: Configuraciones de usuario (definida en types/)
 */

import { Notification, NotificationSettings } from '../../types/notifications';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para notificaciones y configuraciones (reemplazado por DB real en producción)
const notificationDB = {
  notifications: [] as Notification[],
  settings: [] as NotificationSettings[],
  nextId: 1
};

// 🔔 FUNCIONES DE GESTIÓN DE NOTIFICACIONES

/**
 * ➕ Crea una nueva notificación
 * @param notification - Datos de notificación sin ID y timestamp de creación
 * @returns Notification con ID generado y timestamp de creación
 */
export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: notificationDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  notificationDB.notifications.push(newNotification);
  notificationDB.nextId++;
  return newNotification;
};

/**
 * 📋 Obtiene notificaciones para un usuario específico con filtrado opcional
 * @param userId - ID del usuario
 * @param limit - Número máximo de notificaciones a retornar (por defecto 50)
 * @param type - Filtro opcional de tipo de notificación
 * @returns Array de notificaciones ordenadas por fecha de creación (más recientes primero)
 */
export const getUserNotifications = (userId: string, limit: number = 50, type?: string): Notification[] => {
  let notifications = notificationDB.notifications.filter(n => n.userId === userId);
  
  // Filter by notification type if specified
  if (type) {
    notifications = notifications.filter(n => n.type === type);
  }
  
  return notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

/**
 * ✅ Marca una notificación específica como leída
 * @param notificationId - ID de la notificación
 * @param userId - ID del usuario (para validación de propiedad)
 * @returns true si se marcó como leída, false si no se encontró o no pertenece al usuario
 */
export const markNotificationAsRead = (notificationId: string, userId: string): boolean => {
  const notification = notificationDB.notifications.find(n => n.id === notificationId && n.userId === userId);
  if (notification) {
    notification.isRead = true;
    return true;
  }
  return false;
};

/**
 * ✅ Marca todas las notificaciones como leídas para un usuario
 * @param userId - ID del usuario
 * @returns Número de notificaciones que fueron marcadas como leídas
 */
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

/**
 * 🗑️ Elimina una notificación específica
 * @param notificationId - ID de la notificación
 * @param userId - ID del usuario (para validación de propiedad)
 * @returns true si se eliminó, false si no se encontró o no pertenece al usuario
 */
export const deleteNotification = (notificationId: string, userId: string): boolean => {
  const index = notificationDB.notifications.findIndex(n => n.id === notificationId && n.userId === userId);
  if (index !== -1) {
    notificationDB.notifications.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * 🗑️ Limpia todas las notificaciones para un usuario
 * @param userId - ID del usuario
 * @returns Número de notificaciones que fueron limpiadas
 */
export const clearAllNotifications = (userId: string): number => {
  const initialLength = notificationDB.notifications.length;
  notificationDB.notifications = notificationDB.notifications.filter(n => n.userId !== userId);
  return initialLength - notificationDB.notifications.length;
};

/**
 * 🔢 Obtiene conteo de notificaciones no leídas para un usuario
 * @param userId - ID del usuario
 * @returns Número de notificaciones no leídas
 */
export const getUnreadCount = (userId: string): number => {
  return notificationDB.notifications.filter(n => n.userId === userId && !n.isRead).length;
};

// ⚙️ GESTIÓN DE CONFIGURACIONES DE NOTIFICACIÓN

/**
 * ✏️ Actualiza configuraciones de notificación del usuario
 * @param userId - ID del usuario
 * @param settings - Configuraciones a actualizar
 * @returns Configuraciones actualizadas
 */
export const updateNotificationSettings = (userId: string, settings: Partial<NotificationSettings>): NotificationSettings => {
  let userSettings = notificationDB.settings.find(s => s.userId === userId);
  
  if (!userSettings) {
    userSettings = {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: false
    };
    notificationDB.settings.push(userSettings);
  }
  
  const updatedSettings = Object.assign({}, userSettings, settings);
  const index = notificationDB.settings.findIndex(s => s.userId === userId);
  if (index !== -1) {
    notificationDB.settings[index] = updatedSettings;
  }
  return updatedSettings;
};

/**
 * ⚙️ Obtiene configuraciones de notificación del usuario
 * @param userId - ID del usuario
 * @returns Configuraciones del usuario o configuraciones por defecto
 */
export const getNotificationSettings = (userId: string): NotificationSettings => {
  const userSettings = notificationDB.settings.find(s => s.userId === userId);
  
  if (userSettings) return userSettings;
  
  // Create and return default settings
  const defaultSettings: NotificationSettings = {
    userId,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  };
  
  notificationDB.settings.push(defaultSettings);
  return defaultSettings;
};
