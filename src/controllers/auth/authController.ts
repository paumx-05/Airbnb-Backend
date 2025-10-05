import { Request, Response } from 'express';
import { findUserByEmail, createUser, findUserById, updateUserPassword, hashPassword, comparePassword, isPasswordValid } from '../../models/auth/user';
import { generateToken, comparePassword as mockComparePassword } from '../../utils/jwtMock';
import { validateEmail, validateName, validateRequiredFields, sanitizeInput } from '../../utils/validation';
import { sendPasswordResetEmail } from '../../utils/emailMock';
import { generateResetToken, verifyResetToken, invalidateResetToken } from '../../utils/resetTokenMock';
import { AuthResponse } from '../../types/auth';

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validar campos requeridos
    const missingFields = validateRequiredFields(req.body, ['email', 'password', 'name']);
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: { message: `Campos requeridos: ${missingFields.join(', ')}` }
      });
      return;
    }

    // Sanitizar inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);

    // Validaciones
    if (!validateEmail(sanitizedEmail)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }

    if (!isPasswordValid(password)) {
      res.status(400).json({
        success: false,
        error: { message: 'La contraseña debe tener al menos 8 caracteres' }
      });
      return;
    }

    if (!validateName(sanitizedName)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nombre debe tener mínimo 2 caracteres' }
      });
      return;
    }

    // Verificar si usuario ya existe
    const existingUser = await findUserByEmail(sanitizedEmail);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'Usuario ya existe' }
      });
      return;
    }

    // Crear usuario usando la función del modelo simplificada
    const hashedPassword = await hashPassword(password);
    
    // Usar la función createUser pero con validación de contraseña ya hecha
    const newUserResult = await createUser({
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName
    });

    if (!newUserResult.success || !newUserResult.data) {
      res.status(500).json({
        success: false,
        error: { message: newUserResult.error || 'Error creando usuario' }
      });
      return;
    }

    const newUser = newUserResult.data;

    // Generar token
    const token = generateToken(newUser.id, newUser.email);

    const response: AuthResponse = {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error en register:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    const missingFields = validateRequiredFields(req.body, ['email', 'password']);
    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: { message: `Campos requeridos: ${missingFields.join(', ')}` }
      });
      return;
    }

    // Sanitizar email
    const sanitizedEmail = sanitizeInput(email);

    // Validar formato de email
    if (!validateEmail(sanitizedEmail)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }

    // Buscar usuario
    const user = await findUserByEmail(sanitizedEmail);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar password usando la función correcta
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar si usuario está activo
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: { message: 'Cuenta desactivada' }
      });
      return;
    }

    // Generar token
    const token = generateToken(user.id, user.email);

    const response: AuthResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar
        },
        token
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // En un sistema real, aquí invalidaríamos el token
    // Para mock, simplemente confirmamos el logout
    res.json({
      success: true,
      data: { message: 'Logout exitoso' }
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// GET /api/auth/me
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Token inválido' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Validar email
    if (!validateEmail(email)) {
      res.status(400).json({
        success: false,
        error: { message: 'Email inválido' }
      });
      return;
    }
    
    // Buscar usuario (por seguridad, no revelamos si existe o no)
    const user = await findUserByEmail(email);
    
    if (user && user.isActive) {
      // Generar token de reset
      const resetToken = generateResetToken(user.id, user.email);
      
      // Enviar email
      const emailResult = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailResult.success) {
        res.status(500).json({
          success: false,
          error: { message: 'Error enviando email de recuperación' }
        });
        return;
      }
    }
    
    // Siempre devolver éxito por seguridad (no revelar si email existe)
    res.json({
      success: true,
      data: {
        message: 'Si el email está registrado, recibirás instrucciones para recuperar tu contraseña'
      }
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    // Validar datos
    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'Token y nueva contraseña son requeridos' }
      });
      return;
    }
    
    if (!isPasswordValid(newPassword)) {
      res.status(400).json({
        success: false,
        error: { message: 'La nueva contraseña debe tener al menos 8 caracteres' }
      });
      return;
    }
    
    // Verificar token
    const decoded = verifyResetToken(token);
    if (!decoded) {
      res.status(400).json({
        success: false,
        error: { message: 'Token inválido o expirado' }
      });
      return;
    }
    
    // Buscar usuario
    const user = await findUserById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Actualizar contraseña
    const hashedPassword = await hashPassword(newPassword);
    const updateResult = await updateUserPassword(user.id, hashedPassword);
    
    if (!updateResult.success) {
      res.status(500).json({
        success: false,
        error: { message: 'Error actualizando contraseña' }
      });
      return;
    }
    
    // Invalidar token usado
    invalidateResetToken(token);
    
    res.json({
      success: true,
      data: {
        message: 'Contraseña restablecida exitosamente'
      }
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error interno del servidor' }
    });
  }
};
