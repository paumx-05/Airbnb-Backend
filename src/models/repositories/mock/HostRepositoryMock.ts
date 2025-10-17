/**
 * 🎯 REPOSITORY MOCK DE HOST
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Implementación Mock del repositorio de host.
 * Migra toda la lógica actual de src/models/host/hostMock.ts
 * 
 * 🔧 CARACTERÍSTICAS:
 * - Implementa IHostRepository
 * - Mantiene compatibilidad total con la API actual
 * - Usa datos en memoria (Mock)
 */

import { IHostRepository } from '../../interfaces/IHostRepository';
import { HostProperty, HostStats } from '../../../types/host';

export class HostRepositoryMock implements IHostRepository {
  private hostDB = {
    properties: [] as HostProperty[],
    nextId: 1
  };

  constructor() {
    // Inicializar con datos de ejemplo si es necesario
  }

  // ➕ FUNCIONES DE CREACIÓN
  async createHostProperty(property: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): Promise<HostProperty> {
    const newProperty: HostProperty = {
      ...property,
      id: this.hostDB.nextId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.hostDB.properties.push(newProperty);
    this.hostDB.nextId++;
    return newProperty;
  }

  // 🔍 FUNCIONES DE BÚSQUEDA
  async getHostProperties(hostId: string): Promise<HostProperty[]> {
    return this.hostDB.properties
      .filter(property => property.hostId === hostId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getHostPropertyById(id: string): Promise<HostProperty | null> {
    return this.hostDB.properties.find(property => property.id === id) || null;
  }

  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  async updateHostProperty(id: string, updates: Partial<HostProperty>): Promise<HostProperty | null> {
    const propertyIndex = this.hostDB.properties.findIndex(property => property.id === id);
    if (propertyIndex === -1) return null;
    
    this.hostDB.properties[propertyIndex] = {
      ...this.hostDB.properties[propertyIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.hostDB.properties[propertyIndex];
  }

  // 🗑️ FUNCIONES DE ELIMINACIÓN
  async deleteHostProperty(id: string): Promise<boolean> {
    const propertyIndex = this.hostDB.properties.findIndex(property => property.id === id);
    if (propertyIndex === -1) return false;
    
    this.hostDB.properties.splice(propertyIndex, 1);
    return true;
  }

  // 📊 FUNCIONES DE ESTADÍSTICAS
  async getHostStats(hostId: string): Promise<HostStats> {
    const properties = await this.getHostProperties(hostId);
    
    // Calcular estadísticas básicas
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.isActive === true).length;
    
    // Calcular ingresos (simulado)
    let totalRevenue = 0;
    let confirmedReservations = 0;
    
    // En una implementación real, esto vendría de las reservas
    properties.forEach(property => {
      // Simular ingresos basados en el precio y número de propiedades
      totalRevenue += property.pricePerNight * 10; // Simulación
      confirmedReservations += Math.floor(Math.random() * 5); // Simulación
    });

    const averageRating = 4.5; // Simulación
    const occupancyRate = confirmedReservations > 0 ? (confirmedReservations / (totalProperties * 30)) * 100 : 0;

    return {
      totalProperties,
      activeProperties,
      totalReservations: confirmedReservations,
      pendingReservations: Math.floor(confirmedReservations * 0.2), // Simulación
      confirmedReservations,
      totalRevenue,
      averageRating
    };
  }
}
