/**
 * 🏭 FACTORY DE REPOSITORY DE PAGOS
 */

import { IPaymentRepository } from '../interfaces/IPaymentRepository';
import { PaymentRepositoryMock } from '../repositories/mock/PaymentRepositoryMock';
import { PaymentRepositoryMongo } from '../repositories/mongodb/PaymentRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class PaymentRepositoryFactory {
  private static instance: IPaymentRepository;

  static create(): IPaymentRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new PaymentRepositoryMongo();
      } else {
        this.instance = new PaymentRepositoryMock();
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
