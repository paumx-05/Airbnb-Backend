/**
 * MIDDLEWARE DE SEGURIDAD AVANZADA
 * Protecciones adicionales contra ataques comunes
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Lista de IPs bloqueadas (en producción usar Redis o base de datos)
const blockedIPs = new Set<string>();

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Headers de seguridad adicionales
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  });

  next();
};

export const ipBlocking = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (blockedIPs.has(ip)) {
    logger.warn(`Blocked IP attempted access: ${ip}`, {
      path: req.path,
      userAgent: req.get('User-Agent'),
      type: 'ip_blocked'
    });

    res.status(403).json({
      success: false,
      error: { message: 'Acceso denegado' }
    });
    return;
  }

  next();
};

export const requestSizeLimiter = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      logger.warn(`Request too large: ${contentLength} bytes`, {
        path: req.path,
        ip: req.ip,
        maxSize,
        type: 'request_too_large'
      });

      res.status(413).json({
        success: false,
        error: { message: 'Request demasiado grande' }
      });
      return;
    }

    next();
  };
};

// Función para bloquear IP (útil para admin)
export const blockIP = (ip: string): void => {
  blockedIPs.add(ip);
  logger.warn(`IP blocked: ${ip}`, { type: 'ip_blocked_admin' });
};

// Función para desbloquear IP
export const unblockIP = (ip: string): void => {
  blockedIPs.delete(ip);
  logger.info(`IP unblocked: ${ip}`, { type: 'ip_unblocked_admin' });
};
