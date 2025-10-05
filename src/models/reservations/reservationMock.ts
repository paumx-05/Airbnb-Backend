import { Reservation, Availability } from '../../types/reservations';
import { getPropertyById } from '../properties/propertyMock';

// Base de datos mock en memoria
const reservationDB = {
  reservations: [] as Reservation[],
  availability: [] as Availability[],
  nextId: 1
};

// Funciones CRUD para reservas
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

export const getUserReservations = (userId: string): Reservation[] => {
  return reservationDB.reservations
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPropertyReservations = (propertyId: string): Reservation[] => {
  return reservationDB.reservations
    .filter(r => r.propertyId === propertyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getReservationById = (id: string): Reservation | null => {
  return reservationDB.reservations.find(r => r.id === id) || null;
};

export const updateReservationStatus = (id: string, status: Reservation['status']): boolean => {
  const reservation = reservationDB.reservations.find(r => r.id === id);
  if (reservation) {
    reservation.status = status;
    reservation.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const checkAvailability = (propertyId: string, checkIn: string, checkOut: string): boolean => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Verificar que no haya reservas confirmadas en esas fechas
  const conflictingReservations = reservationDB.reservations.filter(r => 
    r.propertyId === propertyId && 
    r.status === 'confirmed' &&
    ((new Date(r.checkIn) <= checkInDate && new Date(r.checkOut) > checkInDate) ||
     (new Date(r.checkIn) < checkOutDate && new Date(r.checkOut) >= checkOutDate) ||
     (new Date(r.checkIn) >= checkInDate && new Date(r.checkOut) <= checkOutDate))
  );
  
  return conflictingReservations.length === 0;
};

export const calculateTotalPrice = (propertyId: string, checkIn: string, checkOut: string, guests: number): {
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  nights: number;
} => {
  const property = getPropertyById(propertyId);
  if (!property) {
    return {
      basePrice: 0,
      cleaningFee: 0,
      serviceFee: 0,
      taxes: 0,
      totalPrice: 0,
      nights: 0
    };
  }
  
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = property.pricePerNight * nights;
  
  // Calcular impuestos y tarifas (simplificado)
  const cleaningFee = 50;
  const serviceFee = Math.round(basePrice * 0.1);
  const taxes = Math.round(basePrice * 0.08);
  
  return {
    basePrice,
    cleaningFee,
    serviceFee,
    taxes,
    totalPrice: basePrice + cleaningFee + serviceFee + taxes,
    nights
  };
};

export const getAllReservations = (): Reservation[] => {
  return reservationDB.reservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getReservationStats = (): {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
} => {
  const total = reservationDB.reservations.length;
  const pending = reservationDB.reservations.filter(r => r.status === 'pending').length;
  const confirmed = reservationDB.reservations.filter(r => r.status === 'confirmed').length;
  const cancelled = reservationDB.reservations.filter(r => r.status === 'cancelled').length;
  const completed = reservationDB.reservations.filter(r => r.status === 'completed').length;

  return {
    total,
    pending,
    confirmed,
    cancelled,
    completed
  };
};
