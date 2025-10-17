/**
 * 🏭 FACTORY DE REPOSITORY DE RESERVAS
 */

import { IReservationRepository } from '../interfaces/IReservationRepository';
import { ReservationRepositoryMock } from '../repositories/mock/ReservationRepositoryMock';
import { ReservationRepositoryMongo } from '../repositories/mongodb/ReservationRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class ReservationRepositoryFactory {
  private static instance: IReservationRepository;

  static create(): IReservationRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new ReservationRepositoryMongo();
      } else {
        this.instance = new ReservationRepositoryMock();
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
