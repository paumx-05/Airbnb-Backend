/**
 * CONTROLADOR DE USUARIOS - CRUD COMPLETO
 * Implementa operaciones CRUD para gestión de usuarios
 * Usa mock data en memoria (sin MongoDB)
 */

import { Request, Response } from 'express';
import {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  removePasswordFromUser,
  CreateUserData,
  UpdateUserData
} from '../../models/auth/user';

// =============================================================================
// INTERFACES Y TIPOS
// =============================================================================

interface UserResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// =============================================================================
// OPERACIONES CRUD
// =============================================================================

/**
 * GET /api/users
 * Obtener lista de usuarios con paginación y filtros
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query as PaginationParams;
    
    // Obtener todos los usuarios
    const allUsers = await getAllUsers();
    
    // Aplicar filtro de búsqueda si existe
    let filteredUsers = allUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Remover contraseñas de la respuesta
    const safeUsers = paginatedUsers.map(user => removePasswordFromUser(user));
    
    const response: UserResponse = {
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * GET /api/users/:id
 * Obtener usuario específico por ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    const user = await findUserById(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(user);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * POST /api/users
 * Crear nuevo usuario
 */
export const createNewUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password, avatar } = req.body;
    
    // Validar campos requeridos
    if (!email || !name || !password) {
      res.status(400).json({
        success: false,
        error: 'Email, nombre y contraseña son requeridos'
      });
      return;
    }
    
    // Preparar datos del usuario
    const userData: CreateUserData = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password,
      avatar: avatar?.trim() || undefined
    };
    
    // Crear usuario usando el modelo
    const result = await createUser(userData);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(result.data!);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: 'Usuario creado exitosamente'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error en createNewUser:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * PUT /api/users/:id
 * Actualizar usuario completo
 */
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, avatar, isActive } = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Preparar datos de actualización
    const updateData: UpdateUserData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (avatar !== undefined) updateData.avatar = avatar?.trim() || undefined;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Actualizar usuario
    const result = await updateUser(id, updateData);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(result.data!);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: 'Usuario actualizado exitosamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en updateUserById:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * PATCH /api/users/:id
 * Actualizar usuario parcialmente
 */
export const patchUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Preparar datos de actualización (solo campos presentes)
    const updateData: UpdateUserData = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.email !== undefined) updateData.email = updates.email.trim().toLowerCase();
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar?.trim() || undefined;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    
    // Actualizar usuario
    const result = await updateUser(id, updateData);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }
    
    // Remover contraseña de la respuesta
    const safeUser = removePasswordFromUser(result.data!);
    
    const response: UserResponse = {
      success: true,
      data: { user: safeUser },
      message: 'Usuario actualizado exitosamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en patchUserById:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * DELETE /api/users/:id
 * Eliminar usuario (soft delete)
 */
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID de usuario requerido'
      });
      return;
    }
    
    // Verificar que el usuario existe
    const existingUser = await findUserById(id);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
      return;
    }
    
    // Eliminar usuario (soft delete)
    const result = await deleteUser(id);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }
    
    const response: UserResponse = {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en deleteUserById:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * GET /api/users/stats
 * Obtener estadísticas de usuarios
 */
export const getUserStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getUserStats();
    
    const response: UserResponse = {
      success: true,
      data: { statistics: stats }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error en getUserStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
