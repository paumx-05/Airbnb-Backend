/**
 * RUTAS DE ESTADÍSTICAS Y MONITOREO
 * Endpoints para métricas del sistema
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth/authMiddleware';
import logger from '../../utils/logger';
import { cache } from '../../utils/cache';
import { getEmailLog } from '../../utils/emailMock';
import { getActiveTokensCount } from '../../utils/resetTokenMock';

const router = Router();

// GET /api/stats
router.get('/', authenticateToken, (req: Request, res: Response) => {
  try {
    const logMetrics = logger.getMetrics();
    const cacheStats = cache.getStats();
    const emailLog = getEmailLog();
    const activeTokens = getActiveTokensCount();

    res.json({
      success: true,
      data: {
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development'
        },
        logs: logMetrics,
        cache: cacheStats,
        email: {
          totalSent: emailLog.length,
          recentSent: emailLog.slice(-10).map(email => ({
            to: email.to,
            subject: email.subject,
            sentAt: email.sentAt
          }))
        },
        auth: {
          activeResetTokens: activeTokens
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas' }
    });
  }
});

// GET /api/stats/logs
router.get('/logs', authenticateToken, (req: Request, res: Response) => {
  try {
    const { level, limit = 50 } = req.query;
    
    const logs = logger.getLogs(level as any, parseInt(limit as string));
    
    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        level: level || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo logs' }
    });
  }
});

// POST /api/stats/logs/clear
router.post('/logs/clear', authenticateToken, (req: Request, res: Response) => {
  try {
    logger.clearLogs();
    
    res.json({
      success: true,
      data: {
        message: 'Logs limpiados exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error limpiando logs' }
    });
  }
});

export default router;
