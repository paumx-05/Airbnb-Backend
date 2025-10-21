/**
 * 🎯 REPOSITORY MOCK DE NOTIFICACIONES
 */

import { INotificationRepository } from '../../interfaces/INotificationRepository';
import { Notification, NotificationSettings } from '../../../types/notifications';

export class NotificationRepositoryMock implements INotificationRepository {
  private notificationDB = {
    notifications: [] as Notification[],
    settings: [] as NotificationSettings[],
    nextId: 1
  };

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.notificationDB.nextId.toString(),
      createdAt: new Date().toISOString()
    };
    this.notificationDB.notifications.push(newNotification);
    this.notificationDB.nextId++;
    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationDB.notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notificationIndex = this.notificationDB.notifications.findIndex(
      notification => notification.id === notificationId
    );
    if (notificationIndex === -1) return false;
    
    this.notificationDB.notifications[notificationIndex].isRead = true;
    return true;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const userNotifications = this.notificationDB.notifications.filter(
      notification => notification.userId === userId
    );
    
    userNotifications.forEach(notification => {
      notification.isRead = true;
    });
    
    return userNotifications.length > 0;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const notificationIndex = this.notificationDB.notifications.findIndex(
      notification => notification.id === notificationId
    );
    if (notificationIndex === -1) return false;
    
    this.notificationDB.notifications.splice(notificationIndex, 1);
    return true;
  }

  async clearAllNotifications(userId: string): Promise<boolean> {
    const initialLength = this.notificationDB.notifications.length;
    this.notificationDB.notifications = this.notificationDB.notifications.filter(
      notification => notification.userId !== userId
    );
    return this.notificationDB.notifications.length < initialLength;
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    const settings = this.notificationDB.settings.find(s => s.userId === userId);
    
    if (!settings) {
      const newSettings: NotificationSettings = {
        userId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: true
      };
      this.notificationDB.settings.push(newSettings);
      return newSettings;
    }
    
    return settings;
  }

  async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    let userSettings = this.notificationDB.settings.find(s => s.userId === userId);
    
    if (!userSettings) {
      userSettings = await this.getNotificationSettings(userId);
    }
    
    const updatedSettings: NotificationSettings = {
      ...userSettings,
      ...settings
    };
    
    const settingsIndex = this.notificationDB.settings.findIndex(s => s.userId === userId);
    if (settingsIndex !== -1) {
      this.notificationDB.settings[settingsIndex] = updatedSettings;
    }
    
    return updatedSettings;
  }

  async createTestNotification(userId: string): Promise<Notification> {
    return await this.createNotification({
      userId,
      type: 'system',
      title: 'Notificación de Prueba',
      message: 'Esta es una notificación de prueba del sistema.',
      isRead: false
    });
  }

  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    const total = this.notificationDB.notifications.length;
    const unread = this.notificationDB.notifications.filter(n => !n.isRead).length;
    
    const byType: Record<string, number> = {};
    this.notificationDB.notifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
    });

    return {
      total,
      unread,
      byType
    };
  }
}
