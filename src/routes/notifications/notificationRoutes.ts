import { Router } from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllNotificationsAsRead, 
  removeNotification, 
  clearAllUserNotifications,
  createTestNotification,
  getNotificationSettings,
  updateNotificationSettings
} from '../../controllers/notifications/notificationController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de notificaciones
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllNotificationsAsRead);
router.delete('/:id', removeNotification);
router.delete('/clear-all', clearAllUserNotifications);
router.post('/test', createTestNotification);
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

export default router;
