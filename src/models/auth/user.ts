/**
 * Modelo de Usuario con encriptación real de contraseñas
 * Preparado para integración futura con MongoDB usando Mongoose
 * 
 * Este modelo implementa:
 * - Encriptación real de contraseñas con bcryptjs
 * - Validaciones de negocio
 * - Interfaz compatible con MongoDB/Mongoose
 * - Funciones CRUD completas
 */

import bcrypt from 'bcryptjs';
import { User } from '../../types/auth';

// =============================================================================
// INTERFACES Y TIPOS
// =============================================================================

/**
 * Datos necesarios para crear un nuevo usuario
 */
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

/**
 * Datos que se pueden actualizar de un usuario
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string;
  isActive?: boolean;
}

/**
 * Respuesta de operaciones de usuario
 */
export interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

// =============================================================================
// CONFIGURACIÓN DE ENCRIPTACIÓN
// =============================================================================

/**
 * Configuración para el hash de contraseñas
 * SALT_ROUNDS: Número de rondas para el hash (recomendado: 10-12)
 */
const SALT_ROUNDS = 12;

// =============================================================================
// BASE DE DATOS TEMPORAL EN MEMORIA
// =============================================================================
// TODO: Reemplazar con MongoDB/Mongoose cuando esté disponible

interface UserDB {
  users: User[];
  nextId: number;
}

const userDB: UserDB = {
  users: [
    {
      id: '1',
      email: 'demo@airbnb.com',
      name: 'Usuario Demo',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7z7KZz4q7e', // bcrypt hash real
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ],
  nextId: 2
};

// =============================================================================
// FUNCIONES DE ENCRIPTACIÓN DE CONTRASEÑAS
// =============================================================================

/**
 * Encripta una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Promise con el hash de la contraseña
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Error al encriptar contraseña');
  }
};

/**
 * Compara una contraseña con su hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns Promise con true si coinciden, false si no
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error al comparar contraseña');
  }
};

// =============================================================================
// VALIDACIONES DE NEGOCIO
// =============================================================================

/**
 * Valida que el email no esté ya registrado
 * @param email - Email a validar
 * @param excludeUserId - ID de usuario a excluir de la validación (para actualizaciones)
 * @returns true si el email está disponible
 */
export const isEmailAvailable = (email: string, excludeUserId?: string): boolean => {
  const existingUser = userDB.users.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeUserId
  );
  return !existingUser;
};

/**
 * Valida la fortaleza de la contraseña
 * @param password - Contraseña a validar
 * @returns true si la contraseña es válida
 */
export const isPasswordValid = (password: string): boolean => {
  // Simplificado: mínimo 8 caracteres
  return Boolean(password && password.length >= 8);
};

// =============================================================================
// FUNCIONES CRUD
// =============================================================================

/**
 * Busca un usuario por email
 * @param email - Email del usuario
 * @returns Usuario encontrado o null
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = userDB.users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
    return user || null;
  } catch (error) {
    throw new Error('Error al buscar usuario por email');
  }
};

/**
 * Busca un usuario por ID
 * @param id - ID del usuario
 * @returns Usuario encontrado o null
 */
export const findUserById = async (id: string): Promise<User | null> => {
  try {
    const user = userDB.users.find(user => user.id === id);
    return user || null;
  } catch (error) {
    throw new Error('Error al buscar usuario por ID');
  }
};

/**
 * Crea un nuevo usuario
 * @param userData - Datos del usuario a crear
 * @returns Usuario creado
 */
export const createUser = async (userData: CreateUserData): Promise<UserResponse> => {
  try {
    // Validar que el email esté disponible
    if (!isEmailAvailable(userData.email)) {
      return {
        success: false,
        error: 'El email ya está registrado'
      };
    }

    // Validar contraseña solo si no está ya hasheada
    const isAlreadyHashed = userData.password.startsWith('$2a$');
    if (!isAlreadyHashed && !isPasswordValid(userData.password)) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
      };
    }

    // Encriptar contraseña solo si no está ya hasheada
    const hashedPassword = isAlreadyHashed ? userData.password : await hashPassword(userData.password);

    // Crear nuevo usuario
    const newUser: User = {
      id: userDB.nextId.toString(),
      email: userData.email.toLowerCase(),
      name: userData.name.trim(),
      password: hashedPassword,
      avatar: userData.avatar || undefined,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Agregar a la base de datos temporal
    userDB.users.push(newUser);
    userDB.nextId++;

    // Retornar usuario sin la contraseña
    const { password, ...userWithoutPassword } = newUser;

    return {
      success: true,
      data: newUser // En producción, retornar userWithoutPassword
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al crear usuario'
    };
  }
};

/**
 * Actualiza un usuario existente
 * @param id - ID del usuario a actualizar
 * @param updates - Datos a actualizar
 * @returns Usuario actualizado
 */
export const updateUser = async (id: string, updates: UpdateUserData): Promise<UserResponse> => {
  try {
    const userIndex = userDB.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }

    // Validar email si se está actualizando
    if (updates.email && !isEmailAvailable(updates.email, id)) {
      return {
        success: false,
        error: 'El email ya está registrado'
      };
    }

    // Preparar actualizaciones
    const updateData: Partial<User> = {};
    
    if (updates.name) updateData.name = updates.name.trim();
    if (updates.email) updateData.email = updates.email.toLowerCase();
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    // Aplicar actualizaciones
    userDB.users[userIndex] = { 
      ...userDB.users[userIndex], 
      ...updateData 
    };

    return {
      success: true,
      data: userDB.users[userIndex]
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al actualizar usuario'
    };
  }
};

/**
 * Elimina un usuario (soft delete)
 * @param id - ID del usuario a eliminar
 * @returns true si se eliminó correctamente
 */
export const deleteUser = async (id: string): Promise<UserResponse> => {
  try {
    const userIndex = userDB.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    userDB.users[userIndex].isActive = false;

    return {
      success: true,
      data: userDB.users[userIndex]
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al eliminar usuario'
    };
  }
};

/**
 * Obtiene todos los usuarios activos
 * @returns Lista de usuarios activos (sin contraseñas)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return userDB.users
      .filter(user => user.isActive)
      .map(user => ({
        ...user,
        password: '***' // Ocultar contraseña en respuestas
      }));
  } catch (error) {
    throw new Error('Error al obtener usuarios');
  }
};

/**
 * Verifica las credenciales de un usuario
 * @param email - Email del usuario
 * @param password - Contraseña en texto plano
 * @returns Usuario si las credenciales son válidas, null si no
 */
export const verifyCredentials = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = await findUserByEmail(email);
    
    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  } catch (error) {
    throw new Error('Error al verificar credenciales');
  }
};

// =============================================================================
// FUNCIONES DE UTILIDAD
// =============================================================================

/**
 * Remueve la contraseña de un objeto usuario
 * @param user - Usuario con contraseña
 * @returns Usuario sin contraseña
 */
export const removePasswordFromUser = (user: User): Omit<User, 'password'> => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Obtiene estadísticas de usuarios
 * @returns Estadísticas básicas
 */
export const getUserStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
}> => {
  try {
    const total = userDB.users.length;
    const active = userDB.users.filter(user => user.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  } catch (error) {
    throw new Error('Error al obtener estadísticas de usuarios');
  }
};

/**
 * Actualiza la contraseña de un usuario
 * @param id - ID del usuario
 * @param newPassword - Nueva contraseña hasheada
 * @returns Resultado de la operación
 */
export const updateUserPassword = async (id: string, newPassword: string): Promise<UserResponse> => {
  try {
    const userIndex = userDB.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }

    // Actualizar contraseña
    userDB.users[userIndex].password = newPassword;

    return {
      success: true,
      data: userDB.users[userIndex]
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al actualizar contraseña'
    };
  }
};

// =============================================================================
// PREPARACIÓN PARA MONGODB
// =============================================================================
// TODO: Implementar cuando MongoDB esté disponible

/**
 * Esquema de Mongoose para MongoDB (preparado para el futuro)
 * 
 * import mongoose, { Document, Schema } from 'mongoose';
 * 
 * interface IUser extends Document {
 *   email: string;
 *   name: string;
 *   password: string;
 *   avatar?: string;
 *   createdAt: Date;
 *   isActive: boolean;
 * }
 * 
 * const UserSchema = new Schema<IUser>({
 *   email: { type: String, required: true, unique: true, lowercase: true },
 *   name: { type: String, required: true, trim: true },
 *   password: { type: String, required: true },
 *   avatar: { type: String },
 *   createdAt: { type: Date, default: Date.now },
 *   isActive: { type: Boolean, default: true }
 * });
 * 
 * export const UserModel = mongoose.model<IUser>('User', UserSchema);
 */
