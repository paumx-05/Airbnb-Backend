import { HostProperty, HostStats } from '../../types/host';
import { getPropertyReservations } from '../reservations/reservationMock';
import { getPropertyReviewStats } from '../reviews/reviewMock';

// Base de datos mock de propiedades de host
const hostDB = {
  properties: [] as HostProperty[],
  nextId: 1
};

export const createHostProperty = (property: Omit<HostProperty, 'id' | 'createdAt' | 'updatedAt'>): HostProperty => {
  const newProperty: HostProperty = {
    ...property,
    id: hostDB.nextId.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  hostDB.properties.push(newProperty);
  hostDB.nextId++;
  return newProperty;
};

export const getHostProperties = (hostId: string): HostProperty[] => {
  return hostDB.properties
    .filter(p => p.hostId === hostId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getHostPropertyById = (id: string, hostId: string): HostProperty | null => {
  return hostDB.properties.find(p => p.id === id && p.hostId === hostId) || null;
};

export const updateHostProperty = (id: string, hostId: string, updates: Partial<HostProperty>): boolean => {
  const property = hostDB.properties.find(p => p.id === id && p.hostId === hostId);
  if (property) {
    Object.assign(property, updates);
    property.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const deleteHostProperty = (id: string, hostId: string): boolean => {
  const index = hostDB.properties.findIndex(p => p.id === id && p.hostId === hostId);
  if (index !== -1) {
    hostDB.properties.splice(index, 1);
    return true;
  }
  return false;
};

export const getHostStats = (hostId: string): HostStats => {
  const properties = getHostProperties(hostId);
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.isActive).length;
  
  let totalReservations = 0;
  let pendingReservations = 0;
  let confirmedReservations = 0;
  let totalRevenue = 0;
  let totalRating = 0;
  let propertiesWithReviews = 0;
  
  properties.forEach(property => {
    const reservations = getPropertyReservations(property.id);
    totalReservations += reservations.length;
    pendingReservations += reservations.filter(r => r.status === 'pending').length;
    confirmedReservations += reservations.filter(r => r.status === 'confirmed').length;
    totalRevenue += reservations.reduce((sum, r) => sum + r.totalPrice, 0);
    
    const reviewStats = getPropertyReviewStats(property.id);
    if (reviewStats.totalReviews > 0) {
      totalRating += reviewStats.averageRating;
      propertiesWithReviews++;
    }
  });
  
  const averageRating = propertiesWithReviews > 0 ? totalRating / propertiesWithReviews : 0;
  
  return {
    totalProperties,
    activeProperties,
    totalReservations,
    pendingReservations,
    confirmedReservations,
    totalRevenue,
    averageRating: Math.round(averageRating * 10) / 10
  };
};

export const getAllHostProperties = (): HostProperty[] => {
  return hostDB.properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getHostPropertyReservations = (propertyId: string, hostId: string) => {
  const property = getHostPropertyById(propertyId, hostId);
  if (!property) {
    return null;
  }
  
  return getPropertyReservations(propertyId);
};

export const getHostPropertyReviews = (propertyId: string, hostId: string) => {
  const property = getHostPropertyById(propertyId, hostId);
  if (!property) {
    return null;
  }
  
  return getPropertyReviewStats(propertyId);
};
