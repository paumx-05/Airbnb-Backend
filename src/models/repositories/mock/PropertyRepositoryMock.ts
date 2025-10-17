/**
 * 🎯 REPOSITORY MOCK DE PROPIEDADES
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Implementación Mock del repositorio de propiedades.
 * Migra toda la lógica actual de src/models/properties/propertyMock.ts
 */

import { IPropertyRepository } from '../../interfaces/IPropertyRepository';
import { Property, PropertyFilters, SearchResult } from '../../../types/properties';

export class PropertyRepositoryMock implements IPropertyRepository {
  private propertyDB = {
    properties: [] as Property[],
    nextId: 1
  };

  constructor() {
    // Inicializar con datos de ejemplo si es necesario
  }

  // 🔍 FUNCIONES DE BÚSQUEDA
  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyDB.properties.find(property => property.id === id) || null;
  }

  async searchProperties(filters: PropertyFilters): Promise<SearchResult> {
    let filteredProperties = [...this.propertyDB.properties];

    // Aplicar filtros
    if (filters.location) {
      filteredProperties = filteredProperties.filter(property =>
        property.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        property.location.country.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.propertyType) {
      filteredProperties = filteredProperties.filter(property =>
        property.propertyType === filters.propertyType
      );
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(property =>
        property.pricePerNight >= filters.minPrice!
      );
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(property =>
        property.pricePerNight <= filters.maxPrice!
      );
    }

    if (filters.guests) {
      filteredProperties = filteredProperties.filter(property =>
        property.maxGuests >= filters.guests!
      );
    }

    if (filters.minRating) {
      filteredProperties = filteredProperties.filter(property =>
        property.rating && property.rating >= filters.minRating!
      );
    }

    if (filters.instantBook) {
      filteredProperties = filteredProperties.filter(property =>
        property.instantBook === filters.instantBook
      );
    }

    // Aplicar paginación
    const total = filteredProperties.length;
    const startIndex = filters.offset || 0;
    const endIndex = startIndex + (filters.limit || 20);
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties,
      total,
      page: Math.floor(startIndex / (filters.limit || 20)) + 1,
      limit: filters.limit || 20,
      hasMore: endIndex < total
    };
  }

  async getPopularLocations(): Promise<string[]> {
    // Simular ubicaciones populares
    return [
      'Madrid, España',
      'Barcelona, España',
      'París, Francia',
      'Londres, Reino Unido',
      'Roma, Italia',
      'Nueva York, Estados Unidos',
      'Los Ángeles, Estados Unidos',
      'Tokio, Japón'
    ];
  }

  async getAvailableAmenities(): Promise<string[]> {
    // Simular amenidades disponibles
    return [
      'WiFi',
      'Cocina',
      'Lavadora',
      'Secadora',
      'Aire acondicionado',
      'Calefacción',
      'TV',
      'Piscina',
      'Gimnasio',
      'Estacionamiento',
      'Mascotas permitidas',
      'Accesible para sillas de ruedas'
    ];
  }

  // 📊 FUNCIONES DE ESTADÍSTICAS
  async getPropertyStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
  }> {
    const total = this.propertyDB.properties.length;
    const byType: Record<string, number> = {};
    const byLocation: Record<string, number> = {};

    this.propertyDB.properties.forEach(property => {
      // Contar por tipo
      byType[property.propertyType] = (byType[property.propertyType] || 0) + 1;
      
      // Contar por ubicación
      const location = property.location.city;
      byLocation[location] = (byLocation[location] || 0) + 1;
    });

    return {
      total,
      byType,
      byLocation
    };
  }
}
