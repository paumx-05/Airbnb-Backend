import { Request, Response } from 'express';
import { 
  createHostProperty, 
  getHostProperties, 
  getHostPropertyById,
  updateHostProperty,
  deleteHostProperty,
  getHostStats,
  getHostPropertyReservations,
  getHostPropertyReviews
} from '../../models/host/hostMock';
import { HostPropertyUpdate } from '../../types/host';

// GET /api/host/properties - Obtener propiedades del host
export const getHostPropertiesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const properties = getHostProperties(userId);

    res.json({
      success: true,
      data: {
        properties,
        total: properties.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedades del host' }
    });
  }
};

// POST /api/host/properties - Crear nueva propiedad
export const createHostPropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { title, description, pricePerNight, location, amenities, images, maxGuests, propertyType } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones básicas
    if (!title || !description || !pricePerNight || !location || !maxGuests || !propertyType) {
      res.status(400).json({
        success: false,
        error: { message: 'title, description, pricePerNight, location, maxGuests y propertyType son requeridos' }
      });
      return;
    }

    // Crear propiedad
    const property = createHostProperty({
      hostId: userId,
      title,
      description,
      pricePerNight,
      location,
      amenities: amenities || [],
      images: images || [],
      maxGuests,
      propertyType,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando propiedad' }
    });
  }
};

// GET /api/host/properties/:id - Obtener propiedad específica del host
export const getHostPropertyController = async (req: Request, res: Response): Promise<void> => {
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

    const property = getHostPropertyById(id, userId);

    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedad del host' }
    });
  }
};

// PUT /api/host/properties/:id - Actualizar propiedad del host
export const updateHostPropertyController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updates: HostPropertyUpdate = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = updateHostProperty(id, userId, updates);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando propiedad' }
    });
  }
};

// DELETE /api/host/properties/:id - Eliminar propiedad del host
export const deleteHostPropertyController = async (req: Request, res: Response): Promise<void> => {
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

    const success = deleteHostProperty(id, userId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad eliminada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando propiedad' }
    });
  }
};

// GET /api/host/properties/:id/reservations - Obtener reservas de una propiedad
export const getHostPropertyReservationsController = async (req: Request, res: Response): Promise<void> => {
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

    const reservations = getHostPropertyReservations(id, userId);
    
    if (reservations === null) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

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

// GET /api/host/properties/:id/reviews - Obtener reviews de una propiedad
export const getHostPropertyReviewsController = async (req: Request, res: Response): Promise<void> => {
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

    const reviews = getHostPropertyReviews(id, userId);
    
    if (reviews === null) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews de la propiedad' }
    });
  }
};

// GET /api/host/stats - Obtener estadísticas del host
export const getHostStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const stats = getHostStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas del host' }
    });
  }
};
