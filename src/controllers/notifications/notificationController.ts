import { Request, Response } from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications, 
  getUnreadCount,
  createNotification,
  updateNotificationSettings as updateNotificationSettingsModel,
  getNotificationSettings as getNotificationSettingsModel
} from '../../models/notifications/notificationMock';

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { limit = 50, unreadOnly = false, type } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    let notifications = getUserNotifications(userId, Number(limit), type as string);
    
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.isRead);
    }

    const unreadCount = getUnreadCount(userId);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo notificaciones' }
    });
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = markNotificationAsRead(id, userId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Notificación no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Notificación marcada como leída' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error marcando notificación' }
    });
  }
};

// PATCH /api/notifications/mark-all-read
export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const count = markAllAsRead(userId);

    res.json({
      success: true,
      data: { 
        message: `${count} notificaciones marcadas como leídas`,
        count 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error marcando notificaciones' }
    });
  }
};

// DELETE /api/notifications/:id
export const removeNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = deleteNotification(id, userId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Notificación no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Notificación eliminada' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando notificación' }
    });
  }
};

// DELETE /api/notifications/clear-all
export const clearAllUserNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const count = clearAllNotifications(userId);

    res.json({
      success: true,
      data: { 
        message: `${count} notificaciones eliminadas`,
        count 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando notificaciones' }
    });
  }
};

// POST /api/notifications/test
export const createTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { type = 'system', title = 'Notificación de prueba', message = 'Esta es una notificación de prueba' } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const notification = createNotification({
      userId,
      type,
      title,
      message,
      isRead: false,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando notificación de prueba' }
    });
  }
};

// GET /api/notifications/settings
export const getNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const settings = getNotificationSettingsModel(userId);

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo configuración de notificaciones' }
    });
  }
};

// PUT /api/notifications/settings
export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { email, push, sound, marketing, propertyUpdates, searchAlerts, muteAll } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const settings = updateNotificationSettingsModel(userId, {
      email: Boolean(email),
      push: Boolean(push),
      sound: Boolean(sound),
      marketing: Boolean(marketing),
      propertyUpdates: Boolean(propertyUpdates),
      searchAlerts: Boolean(searchAlerts),
      muteAll: Boolean(muteAll)
    });

    res.json({
      success: true,
      data: { 
        settings,
        message: 'Configuración de notificaciones actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando configuración de notificaciones' }
    });
  }
};