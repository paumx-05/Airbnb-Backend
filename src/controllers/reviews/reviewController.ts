import { Request, Response } from 'express';
import { 
  createReview, 
  getPropertyReviews, 
  getUserReviews,
  getReviewById,
  getPropertyReviewStats,
  getAllReviews,
  getReviewStats,
  updateReview,
  deleteReview
} from '../../models/reviews/reviewMock';
import { ReviewRequest } from '../../types/reviews';

// POST /api/reviews - Crear nueva review
export const createReviewController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId, reservationId, rating, comment, categories } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones básicas
    if (!propertyId || !reservationId || !rating || !comment || !categories) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId, reservationId, rating, comment y categories son requeridos' }
      });
      return;
    }

    // Validar rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: { message: 'Rating debe estar entre 1 y 5' }
      });
      return;
    }

    // Validar categorías
    const requiredCategories = ['cleanliness', 'communication', 'checkin', 'accuracy', 'location', 'value'];
    for (const category of requiredCategories) {
      if (!categories[category] || categories[category] < 1 || categories[category] > 5) {
        res.status(400).json({
          success: false,
          error: { message: `Categoría ${category} debe estar entre 1 y 5` }
        });
        return;
      }
    }

    // Crear review
    const review = createReview({
      propertyId,
      userId,
      reservationId,
      rating,
      comment,
      categories,
      isVerified: true // En un sistema real, verificaríamos la reserva
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando review' }
    });
  }
};

// GET /api/reviews/property/:id - Obtener reviews de una propiedad
export const getPropertyReviewsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit } = req.query;

    const reviews = getPropertyReviews(id, limit ? Number(limit) : 10);

    res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews de la propiedad' }
    });
  }
};

// GET /api/reviews/user/:id - Obtener reviews de un usuario
export const getUserReviewsController = async (req: Request, res: Response): Promise<void> => {
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

    // Solo permitir ver las propias reviews
    if (userId !== id) {
      res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para ver estas reviews' }
      });
      return;
    }

    const reviews = getUserReviews(id);

    res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo reviews del usuario' }
    });
  }
};

// GET /api/reviews/property/:id/stats - Obtener estadísticas de reviews de una propiedad
export const getPropertyReviewStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const stats = getPropertyReviewStats(id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas de reviews' }
    });
  }
};

// GET /api/reviews/stats - Estadísticas generales de reviews (admin)
export const getReviewStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const stats = getReviewStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas generales de reviews' }
    });
  }
};

// PUT /api/reviews/:id - Actualizar review
export const updateReviewController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { rating, comment, categories } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const review = getReviewById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: { message: 'Review no encontrada' }
      });
      return;
    }

    // Solo el autor puede actualizar su review
    if (review.userId !== userId) {
      res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para actualizar esta review' }
      });
      return;
    }

    const updates: any = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;
    if (categories !== undefined) updates.categories = categories;

    const success = updateReview(id, updates);
    
    if (!success) {
      res.status(500).json({
        success: false,
        error: { message: 'Error actualizando review' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Review actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando review' }
    });
  }
};

// DELETE /api/reviews/:id - Eliminar review
export const deleteReviewController = async (req: Request, res: Response): Promise<void> => {
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

    const review = getReviewById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        error: { message: 'Review no encontrada' }
      });
      return;
    }

    // Solo el autor puede eliminar su review
    if (review.userId !== userId) {
      res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para eliminar esta review' }
      });
      return;
    }

    const success = deleteReview(id);
    
    if (!success) {
      res.status(500).json({
        success: false,
        error: { message: 'Error eliminando review' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Review eliminada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando review' }
    });
  }
};
