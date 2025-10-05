interface Property {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  type: 'entire' | 'private' | 'shared';
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  host: {
    id: string;
    name: string;
    avatar: string;
    isSuperhost: boolean;
  };
  availability: {
    checkIn: string;
    checkOut: string;
    minNights: number;
    maxNights: number;
  };
  instantBook: boolean;
  createdAt: string;
  isActive: boolean;
}

interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  propertyType?: 'entire' | 'private' | 'shared';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  minRating?: number;
  instantBook?: boolean;
  limit?: number;
  offset?: number;
}

// Base de datos mock de propiedades
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
      type: 'entire',
      pricePerNight: 1500,
      currency: 'MXN',
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Cocina', 'Aire acondicionado', 'Estacionamiento'],
      images: ['https://via.placeholder.com/400x300', 'https://via.placeholder.com/400x300'],
      rating: 4.8,
      reviewCount: 24,
      host: {
        id: 'host1',
        name: 'María García',
        avatar: 'https://via.placeholder.com/50x50',
        isSuperhost: true
      },
      availability: {
        checkIn: '15:00',
        checkOut: '11:00',
        minNights: 2,
        maxNights: 30
      },
      instantBook: true,
      createdAt: new Date().toISOString(),
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
      type: 'entire',
      pricePerNight: 2500,
      currency: 'MXN',
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['WiFi', 'Cocina', 'Piscina', 'Playa privada', 'Aire acondicionado'],
      images: ['https://via.placeholder.com/400x300', 'https://via.placeholder.com/400x300'],
      rating: 4.9,
      reviewCount: 18,
      host: {
        id: 'host2',
        name: 'Carlos López',
        avatar: 'https://via.placeholder.com/50x50',
        isSuperhost: true
      },
      availability: {
        checkIn: '16:00',
        checkOut: '10:00',
        minNights: 3,
        maxNights: 14
      },
      instantBook: false,
      createdAt: new Date().toISOString(),
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
      type: 'private',
      pricePerNight: 800,
      currency: 'MXN',
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['WiFi', 'Desayuno incluido', 'Aire acondicionado'],
      images: ['https://via.placeholder.com/400x300'],
      rating: 4.5,
      reviewCount: 12,
      host: {
        id: 'host3',
        name: 'Ana Martínez',
        avatar: 'https://via.placeholder.com/50x50',
        isSuperhost: false
      },
      availability: {
        checkIn: '14:00',
        checkOut: '12:00',
        minNights: 1,
        maxNights: 7
      },
      instantBook: true,
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ] as Property[],
  nextId: 4
};

// Funciones de búsqueda y filtrado
export const searchProperties = (filters: SearchFilters): { properties: Property[], total: number } => {
  let filteredProperties = propertyDB.properties.filter(p => p.isActive);

  // Filtrar por ubicación
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filteredProperties = filteredProperties.filter(p => 
      p.location.city.toLowerCase().includes(locationLower) ||
      p.location.address.toLowerCase().includes(locationLower) ||
      p.location.country.toLowerCase().includes(locationLower)
    );
  }

  // Filtrar por tipo de propiedad
  if (filters.propertyType) {
    filteredProperties = filteredProperties.filter(p => p.type === filters.propertyType);
  }

  // Filtrar por precio
  if (filters.minPrice) {
    filteredProperties = filteredProperties.filter(p => p.pricePerNight >= filters.minPrice!);
  }
  if (filters.maxPrice) {
    filteredProperties = filteredProperties.filter(p => p.pricePerNight <= filters.maxPrice!);
  }

  // Filtrar por huéspedes
  if (filters.guests) {
    filteredProperties = filteredProperties.filter(p => p.maxGuests >= filters.guests!);
  }

  // Filtrar por amenidades
  if (filters.amenities && filters.amenities.length > 0) {
    filteredProperties = filteredProperties.filter(p => 
      filters.amenities!.every(amenity => p.amenities.includes(amenity))
    );
  }

  // Filtrar por calificación mínima
  if (filters.minRating) {
    filteredProperties = filteredProperties.filter(p => p.rating >= filters.minRating!);
  }

  // Filtrar por reserva instantánea
  if (filters.instantBook !== undefined) {
    filteredProperties = filteredProperties.filter(p => p.instantBook === filters.instantBook);
  }

  const total = filteredProperties.length;
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  // Aplicar paginación
  const paginatedProperties = filteredProperties.slice(offset, offset + limit);

  return {
    properties: paginatedProperties,
    total
  };
};

export const getPropertyById = (id: string): Property | null => {
  return propertyDB.properties.find(p => p.id === id && p.isActive) || null;
};

export const getPopularLocations = (): Array<{ city: string, country: string, propertyCount: number }> => {
  const locationCounts: { [key: string]: { city: string, country: string, count: number } } = {};
  
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

  return Object.values(locationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getAvailableAmenities = (): string[] => {
  const amenitiesSet = new Set<string>();
  propertyDB.properties.forEach(property => {
    property.amenities.forEach(amenity => amenitiesSet.add(amenity));
  });
  return Array.from(amenitiesSet).sort();
};
