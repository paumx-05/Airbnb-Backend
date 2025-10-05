/**
 * SISTEMA DE TOKENS DE RESET MOCK
 * Simula tokens para recuperación de contraseña
 */

interface ResetTokenPayload {
  userId: string;
  email: string;
  type: 'password-reset';
  iat: number;
  exp: number;
}

// Almacén de tokens de reset activos
const activeResetTokens = new Map<string, ResetTokenPayload>();

export const generateResetToken = (userId: string, email: string): string => {
  const payload: ResetTokenPayload = {
    userId,
    email,
    type: 'password-reset',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  };
  
  // Generar token único
  const token = `reset_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  
  // Guardar token activo
  activeResetTokens.set(token, payload);
  
  // Limpiar tokens expirados
  cleanupExpiredTokens();
  
  return token;
};

export const verifyResetToken = (token: string): ResetTokenPayload | null => {
  try {
    const payload = activeResetTokens.get(token);
    
    if (!payload) {
      return null;
    }
    
    // Verificar expiración
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      activeResetTokens.delete(token);
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
};

export const invalidateResetToken = (token: string): boolean => {
  return activeResetTokens.delete(token);
};

export const cleanupExpiredTokens = (): void => {
  const now = Math.floor(Date.now() / 1000);
  
  for (const [token, payload] of activeResetTokens.entries()) {
    if (payload.exp < now) {
      activeResetTokens.delete(token);
    }
  }
};

export const getActiveTokensCount = (): number => {
  return activeResetTokens.size;
};

// Limpiar tokens expirados cada hora
setInterval(() => {
  cleanupExpiredTokens();
}, 60 * 60 * 1000);
