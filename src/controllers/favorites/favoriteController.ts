import { Request, Response } from 'express';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites,
  isPropertyFavorite,
  createWishlist,
  getUserWishlists,
  getWishlistById,
  updateWishlist,
  deleteWishlist,
  addPropertyToWishlist,
  removePropertyFromWishlist,
  getPublicWishlists,
  getWishlistStats
} from '../../models/favorites/favoriteMock';
import { WishlistRequest } from '../../types/favorites';

// POST /api/favorites - Agregar propiedad a favoritos
export const addToFavoritesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    if (!propertyId) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId es requerido' }
      });
      return;
    }

    const favorite = addToFavorites(userId, propertyId);

    res.status(201).json({
      success: true,
      data: {
        favorite,
        message: 'Propiedad agregada a favoritos'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error agregando a favoritos' }
    });
  }
};

// DELETE /api/favorites/:propertyId - Quitar propiedad de favoritos
export const removeFromFavoritesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = removeFromFavorites(userId, propertyId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada en favoritos' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad removida de favoritos'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error removiendo de favoritos' }
    });
  }
};

// GET /api/favorites - Obtener favoritos del usuario
export const getUserFavoritesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const favorites = getUserFavorites(userId);

    res.json({
      success: true,
      data: {
        favorites,
        total: favorites.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo favoritos' }
    });
  }
};

// GET /api/favorites/:propertyId/status - Verificar si una propiedad está en favoritos
export const checkFavoriteStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { propertyId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const isFavorite = isPropertyFavorite(userId, propertyId);

    res.json({
      success: true,
      data: {
        isFavorite,
        propertyId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error verificando estado de favorito' }
    });
  }
};

// POST /api/favorites/wishlists - Crear nueva wishlist
export const createWishlistController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { name, description, isPublic }: WishlistRequest = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    if (!name) {
      res.status(400).json({
        success: false,
        error: { message: 'name es requerido' }
      });
      return;
    }

    const wishlist = createWishlist(userId, name, description, isPublic);

    res.status(201).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error creando wishlist' }
    });
  }
};

// GET /api/favorites/wishlists - Obtener wishlists del usuario
export const getUserWishlistsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const wishlists = getUserWishlists(userId);

    res.json({
      success: true,
      data: {
        wishlists,
        total: wishlists.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo wishlists' }
    });
  }
};

// GET /api/favorites/wishlists/public - Obtener wishlists públicas
export const getPublicWishlistsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const wishlists = getPublicWishlists();

    res.json({
      success: true,
      data: {
        wishlists,
        total: wishlists.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo wishlists públicas' }
    });
  }
};

// GET /api/favorites/wishlists/:id - Obtener wishlist específica
export const getWishlistController = async (req: Request, res: Response): Promise<void> => {
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

    const wishlist = getWishlistById(id, userId);

    if (!wishlist) {
      res.status(404).json({
        success: false,
        error: { message: 'Wishlist no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo wishlist' }
    });
  }
};

// PUT /api/favorites/wishlists/:id - Actualizar wishlist
export const updateWishlistController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = updateWishlist(id, userId, updates);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Wishlist no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Wishlist actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando wishlist' }
    });
  }
};

// DELETE /api/favorites/wishlists/:id - Eliminar wishlist
export const deleteWishlistController = async (req: Request, res: Response): Promise<void> => {
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

    const success = deleteWishlist(id, userId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Wishlist no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Wishlist eliminada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error eliminando wishlist' }
    });
  }
};

// POST /api/favorites/wishlists/:id/properties - Agregar propiedad a wishlist
export const addPropertyToWishlistController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;
    const { propertyId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    if (!propertyId) {
      res.status(400).json({
        success: false,
        error: { message: 'propertyId es requerido' }
      });
      return;
    }

    const success = addPropertyToWishlist(id, userId, propertyId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Wishlist no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad agregada a wishlist'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error agregando propiedad a wishlist' }
    });
  }
};

// DELETE /api/favorites/wishlists/:id/properties/:propertyId - Quitar propiedad de wishlist
export const removePropertyFromWishlistController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id, propertyId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const success = removePropertyFromWishlist(id, userId, propertyId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: { message: 'Wishlist o propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        message: 'Propiedad removida de wishlist'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error removiendo propiedad de wishlist' }
    });
  }
};

// GET /api/favorites/stats - Estadísticas de favoritos y wishlists
export const getFavoritesStatsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const favorites = getUserFavorites(userId);
    const wishlistStats = getWishlistStats(userId);

    res.json({
      success: true,
      data: {
        favorites: {
          total: favorites.length
        },
        wishlists: wishlistStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo estadísticas de favoritos' }
    });
  }
};
