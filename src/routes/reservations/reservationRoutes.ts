import { Router } from 'express';
import { 
  createReservationController, 
  getUserReservationsController, 
  getPropertyReservationsController,
  updateReservationStatusController,
  checkAvailabilityController,
  calculatePriceController,
  getReservationStatsController
} from '../../controllers/reservations/reservationController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de reservas
router.post('/', createReservationController);
router.get('/my-reservations', getUserReservationsController);
router.get('/property/:id', getPropertyReservationsController);
router.patch('/:id/status', updateReservationStatusController);
router.get('/check-availability', checkAvailabilityController);
router.post('/calculate-price', calculatePriceController);
router.get('/stats', getReservationStatsController);

export default router;
