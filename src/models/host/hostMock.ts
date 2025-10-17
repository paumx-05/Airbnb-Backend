/**
 * 🏠 MODELO MOCK DE HOST
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para gestión de propiedades de hosts. Maneja operaciones CRUD para
 * propiedades de hosts, se integra con reservas y reseñas para proporcionar estadísticas
 * integrales de hosts. Incluye seguimiento de ingresos, tasas de ocupación y métricas de rendimiento.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - HostProperty: Interfaz de propiedad de host con detalles de gestión
 * - HostStats: Estadísticas integrales de rendimiento de host
 * - getPropertyReservations: Función para obtener reservas de propiedades
 * - getPropertyReviewStats: Función para obtener estadísticas de reseñas de propiedades
 */

import { HostProperty, HostStats } from '../../types/host';
import { getPropertyReservations } from '../reservations/reservationMock';
import { getPropertyReviewStats } from '../reviews/reviewMock';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para propiedades de hosts (reemplazado por DB real en producción)
const hostDB = {
  properties: [] as HostProperty[],
  nextId: 1
};

// 🏠 FUNCIONES DE GESTIÓN DE PROPIEDADES DE HOST

/**
 * ➕ Crea un nuevo listado de propiedad de host
 * @param property - Datos de propiedad sin ID y timestamps
 * @returns HostProperty con ID generado y timestamps de creación
 */
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

/**
 * 📋 Obtiene todas las propiedades para un host específico
 * @param hostId - ID del host
 * @returns Array de propiedades de host ordenadas por fecha de creación (más recientes primero)
 */
export const getHostProperties = (hostId: string): HostProperty[] => {
  return hostDB.properties
    .filter(p => p.hostId === hostId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 🔍 Obtiene una propiedad específica de host por ID
 * @param id - ID de la propiedad
 * @param hostId - ID del host (para validación de propiedad)
 * @returns HostProperty si se encontró y pertenece al host, null en caso contrario
 */
export const getHostPropertyById = (id: string, hostId: string): HostProperty | null => {
  return hostDB.properties.find(p => p.id === id && p.hostId === hostId) || null;
};

/**
 * ✏️ Actualiza una propiedad existente de host
 * @param id - ID de la propiedad
 * @param hostId - ID del host (para validación de propiedad)
 * @param updates - Datos parciales de propiedad a actualizar
 * @returns true si se actualizó, false si no se encontró o no pertenece al host
 */
export const updateHostProperty = (id: string, hostId: string, updates: Partial<HostProperty>): boolean => {
  const property = hostDB.properties.find(p => p.id === id && p.hostId === hostId);
  if (property) {
    Object.assign(property, updates);
    property.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

/**
 * 🗑️ Elimina una propiedad de host
 * @param id - ID de la propiedad
 * @param hostId - ID del host (para validación de propiedad)
 * @returns true si se eliminó, false si no se encontró o no pertenece al host
 */
export const deleteHostProperty = (id: string, hostId: string): boolean => {
  const index = hostDB.properties.findIndex(p => p.id === id && p.hostId === hostId);
  if (index !== -1) {
    hostDB.properties.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * 📊 Calcula estadísticas integrales de rendimiento del host
 * @param hostId - ID del host
 * @returns Objeto HostStats con métricas agregadas de todas las propiedades
 */
export const getHostStats = (hostId: string): HostStats => {
  const properties = getHostProperties(hostId);
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.isActive).length;
  
  // Initialize counters for aggregation
  let totalReservations = 0;
  let pendingReservations = 0;
  let confirmedReservations = 0;
  let totalRevenue = 0;
  let totalRating = 0;
  let propertiesWithReviews = 0;
  
  // Aggregate data from all host properties
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
  
  // Calculate average rating across all properties
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

/**
 * 🌍 Obtiene todas las propiedades de hosts de todos los hosts (función de admin)
 * @returns Array de todas las propiedades de hosts ordenadas por fecha de creación (más recientes primero)
 */
export const getAllHostProperties = (): HostProperty[] => {
  return hostDB.properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 📅 Obtiene reservas para una propiedad específica de host
 * @param propertyId - ID de la propiedad
 * @param hostId - ID del host (para validación de propiedad)
 * @returns Array de reservas si se encontró la propiedad y pertenece al host, null en caso contrario
 */
export const getHostPropertyReservations = (propertyId: string, hostId: string) => {
  const property = getHostPropertyById(propertyId, hostId);
  if (!property) {
    return null;
  }
  
  return getPropertyReservations(propertyId);
};

/**
 * ⭐ Obtiene estadísticas de reseñas para una propiedad específica de host
 * @param propertyId - ID de la propiedad
 * @param hostId - ID del host (para validación de propiedad)
 * @returns Estadísticas de reseñas si se encontró la propiedad y pertenece al host, null en caso contrario
 */
export const getHostPropertyReviews = (propertyId: string, hostId: string) => {
  const property = getHostPropertyById(propertyId, hostId);
  if (!property) {
    return null;
  }
  
  return getPropertyReviewStats(propertyId);
};
