import { Router } from 'express';
import { 
  addToFavoritesController, 
  removeFromFavoritesController, 
  getUserFavoritesController,
  checkFavoriteStatusController,
  createWishlistController,
  getUserWishlistsController,
  getPublicWishlistsController,
  getWishlistController,
  updateWishlistController,
  deleteWishlistController,
  addPropertyToWishlistController,
  removePropertyFromWishlistController,
  getFavoritesStatsController
} from '../../controllers/favorites/favoriteController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.get('/wishlists/public', getPublicWishlistsController);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas de favoritos
router.post('/', addToFavoritesController);
router.delete('/:propertyId', removeFromFavoritesController);
router.get('/', getUserFavoritesController);
router.get('/:propertyId/status', checkFavoriteStatusController);

// Rutas de wishlists
router.post('/wishlists', createWishlistController);
router.get('/wishlists', getUserWishlistsController);
router.get('/wishlists/:id', getWishlistController);
router.put('/wishlists/:id', updateWishlistController);
router.delete('/wishlists/:id', deleteWishlistController);

// Gestión de propiedades en wishlists
router.post('/wishlists/:id/properties', addPropertyToWishlistController);
router.delete('/wishlists/:id/properties/:propertyId', removePropertyFromWishlistController);

// Estadísticas
router.get('/stats', getFavoritesStatsController);

export default router;
