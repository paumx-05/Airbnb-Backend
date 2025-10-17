/**
 * 🏭 FACTORY DE REPOSITORY DE HOST
 */

import { IHostRepository } from '../interfaces/IHostRepository';
import { HostRepositoryMock } from '../repositories/mock/HostRepositoryMock';
import { HostRepositoryMongo } from '../repositories/mongodb/HostRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class HostRepositoryFactory {
  private static instance: IHostRepository;

  static create(): IHostRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new HostRepositoryMongo();
      } else {
        this.instance = new HostRepositoryMock();
      }
    }
    
    return this.instance;
  }

  static reset(): void {
    this.instance = null as any;
  }

  static getCurrentType(): string {
    const config = getDatabaseConfig();
    return config.type;
  }
}
