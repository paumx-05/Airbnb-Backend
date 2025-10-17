/**
 * 🏭 FACTORY DE REPOSITORY DE FAVORITOS
 */

import { IFavoriteRepository } from '../interfaces/IFavoriteRepository';
import { FavoriteRepositoryMock } from '../repositories/mock/FavoriteRepositoryMock';
import { FavoriteRepositoryMongo } from '../repositories/mongodb/FavoriteRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class FavoriteRepositoryFactory {
  private static instance: IFavoriteRepository;

  static create(): IFavoriteRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new FavoriteRepositoryMongo();
      } else {
        this.instance = new FavoriteRepositoryMock();
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
