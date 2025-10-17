/**
 * 🏭 FACTORY DE REPOSITORY DE USUARIO
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Factory que selecciona entre implementación Mock y MongoDB
 * basado en la configuración de la base de datos.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Singleton pattern para evitar múltiples instancias
 * - Selección automática basada en DB_TYPE
 * - Reset method para testing
 */

import { IUserRepository } from '../interfaces/IUserRepository';
import { UserRepositoryMock } from '../repositories/mock/UserRepositoryMock';
import { UserRepositoryMongo } from '../repositories/mongodb/UserRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class UserRepositoryFactory {
  private static instance: IUserRepository;

  /**
   * 🏭 Crea o retorna la instancia del repositorio de usuario
   * @returns IUserRepository - Instancia del repositorio
   */
  static create(): IUserRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new UserRepositoryMongo();
      } else {
        this.instance = new UserRepositoryMock();
      }
    }
    
    return this.instance;
  }

  /**
   * 🔄 Resetea la instancia (útil para testing)
   */
  static reset(): void {
    this.instance = null as any;
  }

  /**
   * 🔍 Obtiene el tipo de repositorio actual
   * @returns string - Tipo de repositorio ('mock' | 'mongodb')
   */
  static getCurrentType(): string {
    const config = getDatabaseConfig();
    return config.type;
  }
}
