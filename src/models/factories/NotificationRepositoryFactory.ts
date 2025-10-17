/**
 * 🏭 FACTORY DE REPOSITORY DE NOTIFICACIONES
 */

import { INotificationRepository } from '../interfaces/INotificationRepository';
import { NotificationRepositoryMock } from '../repositories/mock/NotificationRepositoryMock';
import { NotificationRepositoryMongo } from '../repositories/mongodb/NotificationRepositoryMongo';
import { getDatabaseConfig } from '../../config/database';

export class NotificationRepositoryFactory {
  private static instance: INotificationRepository;

  static create(): INotificationRepository {
    if (!this.instance) {
      const config = getDatabaseConfig();
      
      if (config.type === 'mongodb') {
        this.instance = new NotificationRepositoryMongo();
      } else {
        this.instance = new NotificationRepositoryMock();
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
