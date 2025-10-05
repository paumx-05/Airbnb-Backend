import { Request, Response } from 'express';
import { 
  createReservation, 
  getUserReservations, 
  getPropertyReservations,
  getReservationById,
  updateReservationStatus,
  checkAvailability,
  calculateTotalPrice,
  getAllReservations,
  getReservationStats
} from '../../models/reservations/reservationMock';
import { ReservationRequest, PriceCalculationRequest } from '../../types/reservations';

// POST /api/reservations - Crear nueva reserva
export const createReservationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones básicas
    if (!propertyId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId, checkIn, checkOut y guests son requeridos' }
      });
      return;
    }

    // Verificar disponibilidad
    if (!checkAvailability(propertyId, checkIn, checkOut)) {
      res.status(409).json({
        success: false,
        error: { message: 'Las fechas seleccionadas no están disponibles' }
      });
      return;
    }

    // Calcular precio total
    const priceCalculation = calculateTotalPrice(propertyId, checkIn, checkOut, guests);

    // Crear reserva
    const reservation = createReservation({
      propertyId,
      userId,
      hostId: 'host1', // En un sistema real, obtener del property
      checkIn,
      checkOut,
      guests,
      totalPrice: priceCalculation.totalPrice,
      status: 'pending',
      specialRequests,
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      data: {
        reservation,
        priceBreakdown: priceCalculation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando reserva' }
    });
  }
};

// GET /api/reservations/my-reservations - Obtener reservas del usuario
export const getUserReservationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const reservations = getUserReservations(userId);

    res.json({
      success: true,
      data: {
        reservations,
        total: reservations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reservas del usuario' }
    });
  }
};

// GET /api/reservations/property/:id - Obtener reservas de una propiedad
export const getPropertyReservationsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const reservations = getPropertyReservations(id);

    res.json({
      success: true,
      data: {
        reservations,
        total: reservations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reservas de la propiedad' }
    });
  }
};

// PATCH /api/reservations/:id/status - Actualizar estado de reserva
export const updateReservationStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        error: { message: 'Status es requerido' }
      });
      return;
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: { message: 'Status inválido' }
      });
      return;
    }

    const success = updateReservationStatus(id, status);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Reserva no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Estado de reserva actualizado exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando estado de reserva' }
    });
  }
};

// GET /api/reservations/check-availability - Verificar disponibilidad
export const checkAvailabilityController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, checkIn, checkOut } = req.query;

    if (!propertyId || !checkIn || !checkOut) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId, checkIn y checkOut son requeridos' }
      });
      return;
    }

    const isAvailable = checkAvailability(propertyId as string, checkIn as string, checkOut as string);

    res.json({
      success: true,
      data: {
        isAvailable,
        propertyId,
        checkIn,
        checkOut
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando disponibilidad' }
    });
  }
};

// POST /api/reservations/calculate-price - Calcular precio de reserva
export const calculatePriceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;

    if (!propertyId || !checkIn || !checkOut || !guests) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId, checkIn, checkOut y guests son requeridos' }
      });
      return;
    }

    const priceCalculation = calculateTotalPrice(propertyId, checkIn, checkOut, guests);

    res.json({
      success: true,
      data: priceCalculation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error calculando precio' }
    });
  }
};

// GET /api/reservations/stats - Estadísticas de reservas (admin)
export const getReservationStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // En un sistema real, verificaríamos permisos de admin
    const stats = getReservationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas de reservas' }
    });
  }
};
