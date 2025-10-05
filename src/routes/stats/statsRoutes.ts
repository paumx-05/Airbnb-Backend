import { Router } from 'express';
import { Request, Response } from 'express';
import { getRateLimitStats } from '../../middleware/rateLimiter';
import { cache } from '../../utils/cache';
import logger from '../../utils/logger';
import { authenticateToken, requireAdmin } from '../../middleware/auth/authMiddleware';

const router = Router();

// GET /api/stats - Estadísticas del sistema
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const rateLimitStats = getRateLimitStats();
    const cacheStats = cache.getStats();
    const loggerMetrics = logger.getMetrics();

    res.json({
      success: true,
      data: {
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          timestamp: new Date().toISOString()
        },
        rateLimiting: rateLimitStats,
        cache: cacheStats,
        logging: loggerMetrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas' }
    });
  }
});

// GET /api/stats/logs - Ver logs del sistema
router.get('/logs', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, limit = 50 } = req.query;
    const logs = logger.getLogs(level as any, Number(limit));

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

// POST /api/stats/logs/clear - Limpiar logs
router.post('/logs/clear', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
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