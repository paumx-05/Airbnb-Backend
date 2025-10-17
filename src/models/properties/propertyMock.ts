/**
 * 🏠 MODELO MOCK DE PROPIEDADES
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para listados de propiedades y funcionalidad de búsqueda.
 * Proporciona datos de propiedades de ejemplo y operaciones básicas de búsqueda.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - Property: Interfaz de propiedad (definida en types/)
 * - SearchFilters: Criterios de búsqueda (definida en types/)
 */

import { Property, SearchFilters } from '../../types/properties';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Datos de propiedades de ejemplo con ejemplos realistas
const propertyDB = {
  properties: [
    {
      id: '1',
      title: 'Casa moderna en el centro de la ciudad',
      description: 'Hermosa casa moderna con todas las comodidades',
      location: {
        address: 'Calle Principal 123',
        city: 'Ciudad de México',
        country: 'México',
        coordinates: { lat: 19.4326, lng: -99.1332 }
      },
      propertyType: 'entire',
      price: 1500,
      pricePerNight: 1500,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Cocina', 'Aire acondicionado', 'Estacionamiento'],
      images: ['https://via.placeholder.com/400x300', 'https://via.placeholder.com/400x300'],
      rating: 4.8,
      hostId: 'host1',
      instantBook: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: '2',
      title: 'Departamento con vista al mar',
      description: 'Departamento con vista espectacular al océano',
      location: {
        address: 'Avenida del Mar 456',
        city: 'Cancún',
        country: 'México',
        coordinates: { lat: 21.1619, lng: -86.8515 }
      },
      propertyType: 'entire',
      price: 2500,
      pricePerNight: 2500,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['WiFi', 'Cocina', 'Piscina', 'Playa privada', 'Aire acondicionado'],
      images: ['https://via.placeholder.com/400x300', 'https://via.placeholder.com/400x300'],
      rating: 4.9,
      hostId: 'host2',
      instantBook: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      id: '3',
      title: 'Habitación privada en zona turística',
      description: 'Habitación cómoda en el corazón de la ciudad',
      location: {
        address: 'Plaza Mayor 789',
        city: 'Guadalajara',
        country: 'México',
        coordinates: { lat: 20.6597, lng: -103.3496 }
      },
      propertyType: 'private',
      price: 800,
      pricePerNight: 800,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Desayuno incluido', 'Aire acondicionado'],
      images: ['https://via.placeholder.com/400x300'],
      rating: 4.5,
      hostId: 'host3',
      instantBook: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  ] as Property[],
  nextId: 4
};

// 🔍 FUNCIONES DE BÚSQUEDA Y FILTRADO

/**
 * 🔍 Busca propiedades con filtros básicos
 * @param filters - Criterios de búsqueda
 * @returns Array de propiedades filtradas
 */
export const searchProperties = (filters: SearchFilters): Property[] => {
  let results = propertyDB.properties.filter(p => p.isActive);

  // Filter by location
  if (filters.location) {
    const location = filters.location.toLowerCase();
    results = results.filter(p => 
      p.location.city.toLowerCase().includes(location) ||
      p.location.country.toLowerCase().includes(location)
    );
  }

  // Filter by property type
  if (filters.propertyType) {
    results = results.filter(p => p.propertyType === filters.propertyType);
  }

  // Filter by price range
  if (filters.minPrice) results = results.filter(p => p.pricePerNight >= filters.minPrice!);
  if (filters.maxPrice) results = results.filter(p => p.pricePerNight <= filters.maxPrice!);

  // Filter by guest capacity
  if (filters.guests) {
    results = results.filter(p => p.maxGuests >= filters.guests!);
  }

  // Filter by rating
  if (filters.minRating) {
    results = results.filter(p => p.rating && p.rating >= filters.minRating!);
  }

  // Apply pagination
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  
  return results.slice(offset, offset + limit);
};

/**
 * 🏠 Obtiene una propiedad específica por ID
 * @param id - ID de propiedad a buscar
 * @returns Property si se encontró y está activa, null en caso contrario
 */
export const getPropertyById = (id: string): Property | null => {
  return propertyDB.properties.find(p => p.id === id && p.isActive) || null;
};

/**
 * 📍 Obtiene ubicaciones populares con conteos de propiedades
 * @returns Array de ubicaciones ordenadas por conteo de propiedades (top 10)
 */
export const getPopularLocations = (): Array<{ city: string, country: string, propertyCount: number }> => {
  const locationCounts: { [key: string]: { city: string, country: string, count: number } } = {};
  
  // Count properties per location
  propertyDB.properties.forEach(property => {
    const key = `${property.location.city}-${property.location.country}`;
    if (locationCounts[key]) {
      locationCounts[key].count++;
    } else {
      locationCounts[key] = {
        city: property.location.city,
        country: property.location.country,
        count: 1
      };
    }
  });

  // Sort by property count and return top 10
  return Object.values(locationCounts)
    .map(({ city, country, count }) => ({ city, country, propertyCount: count }))
    .sort((a, b) => b.propertyCount - a.propertyCount)
    .slice(0, 10);
};

/**
 * 🏡 Obtiene todas las amenidades únicas disponibles en las propiedades
 * @returns Array ordenado de todas las amenidades disponibles
 */
export const getAvailableAmenities = (): string[] => {
  const amenitiesSet = new Set<string>();
  
  // Collect all unique amenities from all properties
  propertyDB.properties.forEach(property => {
    property.amenities.forEach(amenity => amenitiesSet.add(amenity));
  });
  
  return Array.from(amenitiesSet).sort();
};
