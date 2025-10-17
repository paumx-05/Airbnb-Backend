/**
 * 🏭 FACTORY DE REPOSITORY DE PROPIEDADES
 */

import { IPropertyRepository } from '../interfaces/IPropertyRepository';
import { PropertyRepositoryMock } from '../repositories/mock/PropertyRepositoryMock';
import { PropertyRepositoryMongo } from '../repositories/mongodb/PropertyRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class PropertyRepositoryFactory {
  private static instance: IPropertyRepository;

  static create(): IPropertyRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new PropertyRepositoryMongo();
      } else {
        this.instance = new PropertyRepositoryMock();
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
