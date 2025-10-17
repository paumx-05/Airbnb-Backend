/**
 * ⚠️ DEPRECATED - Usar user.ts en su lugar
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Este archivo está marcado como DEPRECATED. Usa el modelo principal user.ts
 * que incluye encriptación real de contraseñas, validaciones de negocio y
 * está preparado para MongoDB.
 * 
 * 🔧 MIGRACIÓN:
 * - Reemplazar imports de este archivo con imports de '../user'
 * - Este archivo será eliminado en la próxima versión
 */

import { User, UserDB } from '../../types/auth';

// 💾 BASE DE DATOS MOCK EN MEMORIA (LEGACY)
// Base de datos mock simple con datos básicos de usuario
const userDB: UserDB = {
  users: [
    {
      id: '1',
      email: 'demo@airbnb.com',
      name: 'Usuario Demo',
      password: '$2a$10$hashedpassword', // Simulated bcrypt hash
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ],
  nextId: 2
};

// 📋 FUNCIONES CRUD BÁSICAS (LEGACY)

/**
 * 🔍 Busca un usuario por dirección de email (legacy)
 * @param email - Email del usuario a buscar
 * @returns Usuario si se encontró, null en caso contrario
 */
export const findUserByEmail = (email: string): User | null => {
  return userDB.users.find(user => user.email === email) || null;
};

/**
 * ➕ Crea un nuevo usuario (legacy - sin validación)
 * @param userData - Datos del usuario sin ID y timestamp de creación
 * @returns Usuario creado con ID generado
 */
export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: userDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  userDB.users.push(newUser);
  userDB.nextId++;
  return newUser;
};

/**
 * 🔍 Busca un usuario por ID (legacy)
 * @param id - ID del usuario a buscar
 * @returns Usuario si se encontró, null en caso contrario
 */
export const findUserById = (id: string): User | null => {
  return userDB.users.find(user => user.id === id) || null;
};

/**
 * 📋 Obtiene todos los usuarios (legacy)
 * @returns Array de todos los usuarios con contraseñas ocultas
 */
export const getAllUsers = (): User[] => {
  return userDB.users.map(user => ({
    ...user,
    password: '***' // Hide password in responses
  }));
};

/**
 * ✏️ Actualiza un usuario (legacy - sin validación)
 * @param id - ID del usuario a actualizar
 * @param updates - Datos parciales del usuario a actualizar
 * @returns Usuario actualizado o null si no se encontró
 */
export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const userIndex = userDB.users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  userDB.users[userIndex] = { ...userDB.users[userIndex], ...updates };
  return userDB.users[userIndex];
};

/**
 * 🗑️ Elimina un usuario (legacy - eliminación dura)
 * @param id - ID del usuario a eliminar
 * @returns true si se eliminó, false si no se encontró
 */
export const deleteUser = (id: string): boolean => {
  const userIndex = userDB.users.findIndex(user => user.id === id);
  if (userIndex === -1) return false;
  
  userDB.users.splice(userIndex, 1);
  return true;
};
