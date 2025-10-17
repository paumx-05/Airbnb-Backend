/**
 * 🏭 FACTORY DE REPOSITORY DE CARRITO
 */

import { ICartRepository } from '../interfaces/ICartRepository';
import { CartRepositoryMock } from '../repositories/mock/CartRepositoryMock';
import { CartRepositoryMongo } from '../repositories/mongodb/CartRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class CartRepositoryFactory {
  private static instance: ICartRepository;

  static create(): ICartRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new CartRepositoryMongo();
      } else {
        this.instance = new CartRepositoryMock();
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
