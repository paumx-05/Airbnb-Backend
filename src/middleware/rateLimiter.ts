/**
 * MIDDLEWARE DE RATE LIMITING
 * Limita el número de requests por IP para prevenir abuso
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Almacén de rate limits en memoria
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;    // Ventana de tiempo en ms
  maxRequests: number; // Máximo número de requests
  blockDuration?: number; // Duración del bloqueo en ms
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,          // 100 requests por ventana
  blockDuration: 60 * 1000   // 1 minuto de bloqueo
};

export const rateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    // Obtener o crear entrada para esta IP/ruta
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Crear nueva entrada o resetear
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs,
        blocked: false
      };
      rateLimitStore.set(key, entry);
    }

    // Verificar si está bloqueado
    if (entry.blocked && now < entry.resetTime) {
      logger.warn(`Rate limit exceeded for IP: ${ip}`, {
        path: req.path,
        count: entry.count,
        type: 'rate_limit_blocked'
      });

      res.status(429).json({
        success: false,
        error: {
          message: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }
      });
      return;
    }

    // Incrementar contador
    entry.count++;

    // Verificar límite
    if (entry.count > finalConfig.maxRequests) {
      entry.blocked = true;
      entry.resetTime = now + (finalConfig.blockDuration || finalConfig.windowMs);

      logger.warn(`Rate limit exceeded for IP: ${ip}`, {
        path: req.path,
        count: entry.count,
        maxRequests: finalConfig.maxRequests,
        type: 'rate_limit_exceeded'
      });

      res.status(429).json({
        success: false,
        error: {
          message: 'Límite de peticiones excedido. Intenta de nuevo más tarde.',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }
      });
      return;
    }

    // Agregar headers informativos
    res.set({
      'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, finalConfig.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });

    next();
  };
};

// Rate limiter específico para auth endpoints (más restrictivo)
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 50,          // Aumentado temporalmente para pruebas
  blockDuration: 5 * 60 * 1000 // 5 minutos de bloqueo
});

// Limpiar entradas expiradas periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cada 5 minutos

// Función para limpiar rate limiter (útil para desarrollo)
export const clearRateLimit = (): void => {
  rateLimitStore.clear();
  console.log('Rate limit store cleared');
};
