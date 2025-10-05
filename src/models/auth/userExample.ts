/**
 * EJEMPLO DE USO DEL MODELO USER
 * Este archivo muestra cómo usar el nuevo modelo user.ts
 * 
 * IMPORTANTE: Este es solo un archivo de ejemplo para documentación
 * No debe ser usado en producción
 */

import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyCredentials,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserStats,
  removePasswordFromUser,
  CreateUserData,
  UpdateUserData
} from './user';

/**
 * Ejemplo de creación de usuario
 */
export const exampleCreateUser = async (): Promise<void> => {
  try {
    const userData: CreateUserData = {
      email: 'nuevo@ejemplo.com',
      name: 'Usuario Nuevo',
      password: 'Password123', // Debe cumplir con los requisitos de seguridad
      avatar: 'https://via.placeholder.com/150'
    };

    const result = await createUser(userData);
    
    if (result.success) {
      console.log('✅ Usuario creado:', result.data);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * Ejemplo de verificación de credenciales
 */
export const exampleVerifyCredentials = async (): Promise<void> => {
  try {
    const email = 'demo@airbnb.com';
    const password = 'demo123'; // Contraseña del usuario demo

    const user = await verifyCredentials(email, password);
    
    if (user) {
      console.log('✅ Credenciales válidas:', removePasswordFromUser(user));
    } else {
      console.log('❌ Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * Ejemplo de actualización de usuario
 */
export const exampleUpdateUser = async (): Promise<void> => {
  try {
    const userId = '1'; // ID del usuario demo
    const updates: UpdateUserData = {
      name: 'Usuario Demo Actualizado',
      avatar: 'https://via.placeholder.com/200'
    };

    const result = await updateUser(userId, updates);
    
    if (result.success) {
      console.log('✅ Usuario actualizado:', result.data);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * Ejemplo de obtención de estadísticas
 */
export const exampleGetStats = async (): Promise<void> => {
  try {
    const stats = await getUserStats();
    console.log('📊 Estadísticas de usuarios:', stats);
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * Ejecutar todos los ejemplos
 */
export const runAllExamples = async (): Promise<void> => {
  console.log('🚀 Ejecutando ejemplos del modelo User...\n');
  
  await exampleCreateUser();
  console.log('');
  
  await exampleVerifyCredentials();
  console.log('');
  
  await exampleUpdateUser();
  console.log('');
  
  await exampleGetStats();
  console.log('');
  
  console.log('✅ Todos los ejemplos completados');
};
