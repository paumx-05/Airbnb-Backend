/**
 * 🏭 FACTORY DE REPOSITORY DE REVIEWS
 */

import { IReviewRepository } from '../interfaces/IReviewRepository';
import { ReviewRepositoryMock } from '../repositories/mock/ReviewRepositoryMock';
import { ReviewRepositoryMongo } from '../repositories/mongodb/ReviewRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class ReviewRepositoryFactory {
  private static instance: IReviewRepository;

  static create(): IReviewRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new ReviewRepositoryMongo();
      } else {
        this.instance = new ReviewRepositoryMock();
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
