/**
 * 🎯 REPOSITORY MOCK DE RESERVAS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Implementación Mock del repositorio de reservas.
 * Migra toda la lógica actual de src/models/reservations/reservationMock.ts
 */

import { IReservationRepository } from '../../interfaces/IReservationRepository';
import { Reservation, Availability } from '../../../types/reservations';

export class ReservationRepositoryMock implements IReservationRepository {
  private reservationDB = {
    reservations: [] as Reservation[],
    availability: [] as Availability[],
    nextId: 1
  };

  constructor() {
    // Inicializar con datos de ejemplo si es necesario
  }

  // ➕ FUNCIONES DE CREACIÓN
  async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reservation> {
    const newReservation: Reservation = {
      ...reservation,
      id: this.reservationDB.nextId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reservationDB.reservations.push(newReservation);
    this.reservationDB.nextId++;
    return newReservation;
  }

  // 🔍 FUNCIONES DE BÚSQUEDA
  async getUserReservations(userId: string): Promise<Reservation[]> {
    return this.reservationDB.reservations
      .filter(reservation => reservation.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPropertyReservations(propertyId: string): Promise<Reservation[]> {
    return this.reservationDB.reservations
      .filter(reservation => reservation.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    return this.reservationDB.reservations.find(reservation => reservation.id === id) || null;
  }

  // ✏️ FUNCIONES DE ACTUALIZACIÓN
  async updateReservationStatus(id: string, status: string): Promise<Reservation | null> {
    const reservationIndex = this.reservationDB.reservations.findIndex(reservation => reservation.id === id);
    if (reservationIndex === -1) return null;
    
    this.reservationDB.reservations[reservationIndex] = {
      ...this.reservationDB.reservations[reservationIndex],
      status: status as any,
      updatedAt: new Date().toISOString()
    };
    return this.reservationDB.reservations[reservationIndex];
  }

  // 🗑️ FUNCIONES DE ELIMINACIÓN
  async deleteReservation(id: string): Promise<boolean> {
    const reservationIndex = this.reservationDB.reservations.findIndex(reservation => reservation.id === id);
    if (reservationIndex === -1) return false;
    
    this.reservationDB.reservations.splice(reservationIndex, 1);
    return true;
  }

  // 📅 FUNCIONES DE DISPONIBILIDAD
  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Verificar si hay conflictos con reservas existentes
    const conflictingReservations = this.reservationDB.reservations.filter(reservation => {
      if (reservation.propertyId !== propertyId || reservation.status === 'cancelled') {
        return false;
      }
      
      const reservationCheckIn = new Date(reservation.checkIn);
      const reservationCheckOut = new Date(reservation.checkOut);
      
      return (
        (checkInDate < reservationCheckOut && checkOutDate > reservationCheckIn)
      );
    });
    
    return conflictingReservations.length === 0;
  }

  async getPropertyAvailability(propertyId: string): Promise<Availability[]> {
    return this.reservationDB.availability.filter(avail => avail.propertyId === propertyId);
  }

  // 💰 FUNCIONES DE PRECIOS
  async calculatePrice(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    basePrice: number;
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    taxes: number;
    total: number;
  }> {
    // Simular cálculo de precios
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = 100; // Precio base simulado
    const subtotal = basePrice * nights;
    const cleaningFee = 25;
    const serviceFee = subtotal * 0.1;
    const taxes = (subtotal + cleaningFee + serviceFee) * 0.1;
    const total = subtotal + cleaningFee + serviceFee + taxes;

    return {
      basePrice,
      nights,
      subtotal,
      cleaningFee,
      serviceFee,
      taxes,
      total
    };
  }

  // 📊 FUNCIONES DE ESTADÍSTICAS
  async getReservationStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
  }> {
    const total = this.reservationDB.reservations.length;
    const byStatus: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    this.reservationDB.reservations.forEach(reservation => {
      // Contar por estado
      byStatus[reservation.status] = (byStatus[reservation.status] || 0) + 1;
      
      // Contar por mes
      const month = new Date(reservation.createdAt).toISOString().substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    return {
      total,
      byStatus,
      byMonth
    };
  }
}
