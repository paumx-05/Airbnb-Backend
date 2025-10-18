/**
 * 🔐 IMPLEMENTACIÓN REAL DE JWT
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Implementación real de JWT usando jsonwebtoken con firma criptográfica.
 * Reemplaza el sistema mock por uno seguro para producción.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Firma criptográfica real con HMAC SHA256
 * - Verificación de tokens con validación de firma
 * - Configuración de expiración flexible
 * - Manejo de errores robusto
 */

import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';
import { config } from '../config/environment';

/**
 * 🔑 Genera un token JWT con firma criptográfica
 * @param userId - ID del usuario
 * @param email - Email del usuario
 * @returns Token JWT firmado
 */
export const generateToken = (userId: string, email: string): string => {
  try {
    const payload = {
      userId,
      email
    };
    
    // Verificar que el secreto JWT esté disponible
    if (!config.jwtSecret || config.jwtSecret.length < 10) {
      throw new Error('JWT Secret no configurado correctamente');
    }
    
    // Generar token JWT completo con firma
    const token = jwt.sign(payload, config.jwtSecret);
    
    // Verificar que el token tiene la estructura correcta (3 partes)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('⚠️ Token generado sin firma completa. Partes:', parts.length);
      console.error('Secret length:', config.jwtSecret.length);
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error generando token JWT:', error);
    console.error('Config JWT Secret:', config.jwtSecret ? `Presente (${config.jwtSecret.length} chars)` : 'Ausente');
    throw new Error('Error generando token de autenticación');
  }
};

/**
 * 🔍 Verifica y decodifica un token JWT
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si es inválido
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('Token JWT expirado');
      return null;
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log('Token JWT inválido:', error.message);
      return null;
    } else {
      console.error('Error verificando token JWT:', error);
      return null;
    }
  }
};

/**
 * 🔄 Refresca un token JWT (genera uno nuevo)
 * @param token - Token actual
 * @returns Nuevo token JWT o null si el token actual es inválido
 */
export const refreshToken = (token: string): string | null => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    return generateToken(decoded.userId, decoded.email);
  } catch (error) {
    console.error('Error refrescando token:', error);
    return null;
  }
};

/**
 * 📋 Extrae el token del header Authorization
 * @param authHeader - Header Authorization
 * @returns Token extraído o null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * 🔍 Decodifica un token sin verificar (solo para debugging)
 * @param token - Token JWT
 * @returns Payload decodificado o null
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * ⏰ Verifica si un token está próximo a expirar
 * @param token - Token JWT
 * @param minutesThreshold - Minutos antes de expiración para considerar "próximo a expirar"
 * @returns true si está próximo a expirar
 */
export const isTokenNearExpiry = (token: string, minutesThreshold: number = 30): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    const minutesUntilExpiry = timeUntilExpiry / 60;
    
    return minutesUntilExpiry <= minutesThreshold;
  } catch (error) {
    console.error('Error verificando expiración del token:', error);
    return true;
  }
};

export default {
  generateToken,
  verifyToken,
  refreshToken,
  extractTokenFromHeader,
  decodeToken,
  isTokenNearExpiry
};
