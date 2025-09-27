import { JWTPayload } from '../types/auth';

// Simulación de JWT sin dependencias externas
export const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  // Simulación de token (en producción usar jsonwebtoken)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Verificar expiración
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
};

export const hashPassword = (password: string): string => {
  // Simulación de hash (en producción usar bcrypt)
  return `$2a$10$${Buffer.from(password).toString('base64')}`;
};

export const comparePassword = (password: string, hash: string): boolean => {
  // Simulación de comparación (en producción usar bcrypt)
  const expectedHash = `$2a$10$${Buffer.from(password).toString('base64')}`;
  return hash === expectedHash;
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};
