import { Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, shouldRefreshToken, refreshToken } from '../../utils/jwt';
import { AuthenticatedRequest } from '../../types/auth';

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Token de acceso requerido' }
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando token' }
    });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email
        };
      }
    }

    next();
  } catch (error) {
    // En optional auth, continuamos sin usuario
    console.error('Error en optionalAuth:', error);
    next();
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: 'Autenticación requerida' }
      });
      return;
    }

    // En un sistema real, aquí verificaríamos roles de admin desde la BD
    // Para demo, asumimos que admin@demo.com y demo@airbnb.com son admins
    const adminEmails = ['admin@demo.com', 'demo@airbnb.com'];
    if (adminEmails.includes(req.user.email)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: { message: 'Acceso denegado. Se requieren permisos de administrador' }
      });
    }
  } catch (error) {
    console.error('Error en requireAdmin:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando permisos' }
    });
  }
};

/**
 * 🔄 Autenticación con renovación automática de tokens
 * Verifica el token y lo renueva automáticamente si está próximo a expirar
 */
export const authenticateWithAutoRefresh = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Token de acceso requerido' }
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(403).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
      return;
    }

    // Agregar información del usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Verificar si el token necesita renovación
    if (shouldRefreshToken(token)) {
      console.log('🔄 Token próximo a expirar, renovando automáticamente...');
      
      const newToken = refreshToken(token);
      
      if (newToken) {
        console.log('✅ Token renovado exitosamente');
        
        // Agregar el nuevo token a la respuesta
        res.setHeader('X-New-Token', newToken);
        res.setHeader('X-Token-Refreshed', 'true');
      } else {
        console.log('❌ No se pudo renovar el token');
      }
    }

    next();
  } catch (error) {
    console.error('Error en authenticateWithAutoRefresh:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando token' }
    });
  }
};
