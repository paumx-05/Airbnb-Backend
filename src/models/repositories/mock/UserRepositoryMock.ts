/**
 * 🎯 REPOSITORY MOCK DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Implementación Mock del repositorio de usuario.
 * Migra toda la lógica actual de src/models/auth/user.ts
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Implementa IUserRepository
 * - Mantiene compatibilidad total con la API actual
 * - Usa datos en memoria (Mock)
 * - Encriptación real con bcryptjs
 */

import { IUserRepository } from '../../interfaces/IUserRepository';
import { User, CreateUserData, UpdateUserData } from '../../../types/auth';
import bcrypt from 'bcryptjs';

export class UserRepositoryMock implements IUserRepository {
  private userDB = {
    users: [] as User[],
    nextId: 1
  };

  private readonly SALT_ROUNDS = 12;

  constructor() {
    // Inicializar con usuario demo
    this.userDB.users = [
      {
        id: '1',
        email: 'demo@airbnb.com',
        name: 'Usuario Demo',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7z7KZz4q7e', // bcrypt hash real
        avatar: 'https://via.placeholder.com/150',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
    this.userDB.nextId = 2;
  }

  // 🔍 FUNCIONES DE BÚSQUEDA
  async findById(id: string): Promise<User | null> {
    try {
      const user = this.userDB.users.find(user => user.id === id);
      return user || null;
    } catch (error) {
      throw new Error('Error al buscar usuario por ID');
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = this.userDB.users.find(
        user => user.email.toLowerCase() === email.toLowerCase()
      );
      return user || null;
    } catch (error) {
      throw new Error('Error al buscar usuario por email');
    }
  }

  // ➕ FUNCIONES DE CREACIÓN
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Validate email availability
      if (!(await this.isEmailAvailable(userData.email))) {
        throw new Error('El email ya está registrado');
      }

      // Validate password
      if (!this.isPasswordValid(userData.password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      // Encrypt password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create new user
      const newUser: User = {
        id: this.userDB.nextId.toString(),
        email: userData.email.toLowerCase(),
        name: userData.name.trim(),
        password: hashedPassword,
        avatar: userData.avatar,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      this.userDB.users.push(newUser);
      this.userDB.nextId++;

      return newUser;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    try {
      const userIndex = this.userDB.users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }

      // Validate email if being updated
      if (updates.email && !(await this.isEmailAvailable(updates.email, id))) {
        throw new Error('El email ya está registrado');
      }

      // Apply updates
      if (updates.name) this.userDB.users[userIndex].name = updates.name.trim();
      if (updates.email) this.userDB.users[userIndex].email = updates.email.toLowerCase();
      if (updates.avatar !== undefined) this.userDB.users[userIndex].avatar = updates.avatar;
      if (updates.isActive !== undefined) this.userDB.users[userIndex].isActive = updates.isActive;

      return this.userDB.users[userIndex];
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User> {
    try {
      const userIndex = this.userDB.users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }

      // Validate and hash new password
      if (!this.isPasswordValid(newPassword)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      this.userDB.users[userIndex].password = await this.hashPassword(newPassword);

      return this.userDB.users[userIndex];
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // 🗑️ FUNCIONES DE ELIMINACIÓN
  async deleteUser(id: string): Promise<User> {
    try {
      const userIndex = this.userDB.users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }

      // Soft delete: mark as inactive
      this.userDB.users[userIndex].isActive = false;

      return this.userDB.users[userIndex];
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // 📋 FUNCIONES DE LISTADO
  async getAllUsers(): Promise<User[]> {
    try {
      return this.userDB.users
        .filter(user => user.isActive)
        .map(user => ({
          ...user,
          password: '***' // Hide password in responses
        }));
    } catch (error) {
      throw new Error('Error al obtener usuarios');
    }
  }

  // 🔐 FUNCIONES DE AUTENTICACIÓN
  async verifyCredentials(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findUserByEmail(email);
      
      if (!user || !user.isActive) {
        return null;
      }

      const isValidPassword = await this.comparePassword(password, user.password);
      
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      throw new Error('Error al verificar credenciales');
    }
  }

  // 🔒 FUNCIONES DE ENCRIPTACIÓN
  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw new Error('Error al encriptar contraseña');
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Error al comparar contraseña');
    }
  }

  isPasswordValid(password: string): boolean {
    // Simplified: minimum 8 characters
    return Boolean(password && password.length >= 8);
  }

  // ✅ FUNCIONES DE VALIDACIÓN
  async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = this.userDB.users.find(
      user => user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeUserId
    );
    return !existingUser;
  }

  // 🛠️ FUNCIONES DE UTILIDAD
  removePasswordFromUser(user: User): Omit<User, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // 📊 FUNCIONES DE ESTADÍSTICAS
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const total = this.userDB.users.length;
      const active = this.userDB.users.filter(user => user.isActive).length;
      const inactive = total - active;

      return { total, active, inactive };
    } catch (error) {
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }
}
