/**
 * 📅 MODELO MOCK DE RESERVAS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Base de datos mock para sistema de gestión de reservas. Maneja creación de reservas,
 * actualizaciones de estado, verificaciones de disponibilidad y cálculos de precios.
 * Se integra con datos de propiedades para proporcionar información precisa de precios
 * y disponibilidad para el sistema de reservas.
 * 
 * 🔧 IMPORTS Y DEPENDENCIAS:
 * - Reservation: Interfaz de reserva de reserva con seguimiento de estado
 * - Availability: Interfaz de calendario de disponibilidad de propiedades
 * - getPropertyById: Función para obtener detalles de propiedad para precios
 */

import { Reservation, Availability } from '../../types/reservations';
import { getPropertyById } from '../properties/propertyMock';

// 💾 BASE DE DATOS MOCK EN MEMORIA
// Almacenamiento temporal para reservas y disponibilidad (reemplazado por DB real en producción)
const reservationDB = {
  reservations: [] as Reservation[],
  availability: [] as Availability[],
  nextId: 1
};

// 📅 FUNCIONES DE GESTIÓN DE RESERVAS

/**
 * ➕ Crea una nueva reserva de reserva
 * @param reservation - Datos de reserva sin ID y timestamps
 * @returns Reservation con ID generado y timestamps de creación
 */
export const createReservation = (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Reservation => {
  const newReservation: Reservation = {
    ...reservation,
    id: reservationDB.nextId.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  reservationDB.reservations.push(newReservation);
  reservationDB.nextId++;
  return newReservation;
};

/**
 * 👤 Obtiene todas las reservas para un usuario específico
 * @param userId - ID del usuario
 * @returns Array de reservas de usuario ordenadas por fecha de creación (más recientes primero)
 */
export const getUserReservations = (userId: string): Reservation[] => {
  return reservationDB.reservations
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 🏠 Obtiene todas las reservas para una propiedad específica
 * @param propertyId - ID de la propiedad
 * @returns Array de reservas de propiedad ordenadas por fecha de creación (más recientes primero)
 */
export const getPropertyReservations = (propertyId: string): Reservation[] => {
  return reservationDB.reservations
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 🔍 Obtiene una reserva específica por ID
 * @param id - ID de la reserva
 * @returns Reservation si se encontró, null en caso contrario
 */
export const getReservationById = (id: string): Reservation | null => {
  return reservationDB.reservations.find(r => r.id === id) || null;
};

/**
 * 🔄 Actualiza el estado de una reserva
 * @param id - ID de la reserva
 * @param status - Nuevo estado de reserva
 * @returns true si se actualizó, false si no se encontró la reserva
 */
export const updateReservationStatus = (id: string, status: Reservation['status']): boolean => {
  const reservation = reservationDB.reservations.find(r => r.id === id);
  if (reservation) {
    reservation.status = status;
    reservation.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

/**
 * ✅ Verifica si la propiedad está disponible para las fechas especificadas
 * @param propertyId - ID de la propiedad
 * @param checkIn - String de fecha de check-in
 * @param checkOut - String de fecha de check-out
 * @returns true si la propiedad está disponible, false si las fechas entran en conflicto con reservas confirmadas
 */
export const checkAvailability = (propertyId: string, checkIn: string, checkOut: string): boolean => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Check for conflicts with confirmed reservations
  const conflictingReservations = reservationDB.reservations.filter(r => 
    r.propertyId === propertyId && 
    r.status === 'confirmed' &&
    ((new Date(r.checkIn) <= checkInDate && new Date(r.checkOut) > checkInDate) ||
     (new Date(r.checkIn) < checkOutDate && new Date(r.checkOut) >= checkOutDate) ||
     (new Date(r.checkIn) >= checkInDate && new Date(r.checkOut) <= checkOutDate))
  );
  
  return conflictingReservations.length === 0;
};

/**
 * 💰 Calcula precio total básico para una reserva
 * @param propertyId - ID de la propiedad
 * @param checkIn - Fecha de check-in
 * @param checkOut - Fecha de check-out
 * @returns Desglose básico de precios
 */
export const calculateTotalPrice = (propertyId: string, checkIn: string, checkOut: string) => {
  const property = getPropertyById(propertyId);
  if (!property) {
    return { totalPrice: 0, nights: 0 };
  }
  
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = property.pricePerNight * nights;
  const fees = Math.round(basePrice * 0.18); // 18% total fees
  
  return {
    totalPrice: basePrice + fees,
    nights
  };
};

/**
 * 🌍 Obtiene todas las reservas de todas las propiedades (función de admin)
 * @returns Array de todas las reservas ordenadas por fecha de creación (más recientes primero)
 */
export const getAllReservations = (): Reservation[] => {
  return reservationDB.reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 📊 Obtiene estadísticas básicas de reservas
 * @returns Estadísticas básicas de reservas
 */
export const getReservationStats = () => {
  const total = reservationDB.reservations.length;
  const confirmed = reservationDB.reservations.filter(r => r.status === 'confirmed').length;

  return { total, confirmed };
};
