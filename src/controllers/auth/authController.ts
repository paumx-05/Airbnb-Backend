import { Request, Response } from 'express';
import { findUserByEmail, createUser, findUserById } from '../../models/auth/userMock';
import { generateToken, hashPassword, comparePassword } from '../../utils/jwtMock';
import { validateEmail, validatePassword, validateName, validateRequiredFields, sanitizeInput } from '../../utils/validation';
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

    if (!validatePassword(password)) {
      res.status(400).json({
        success: false,
        error: { message: 'Password debe tener mínimo 6 caracteres' }
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
    const existingUser = findUserByEmail(sanitizedEmail);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'Usuario ya existe' }
      });
      return;
    }

    // Crear usuario
    const hashedPassword = hashPassword(password);
    const newUser = createUser({
      email: sanitizedEmail,
      password: hashedPassword,
      name: sanitizedName,
      isActive: true
    });

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
    const user = findUserByEmail(sanitizedEmail);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
      return;
    }

    // Verificar password
    if (!comparePassword(password, user.password)) {
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

    const user = findUserById(userId);
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
