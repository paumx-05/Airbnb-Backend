import { Router } from 'express';
import { 
  updateProfile, 
  changePassword, 
  getProfileSettings, 
  updateProfileSettings 
} from '../../controllers/profile/profileController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de perfil
router.put('/', updateProfile);
router.post('/change-password', changePassword);
router.get('/settings', getProfileSettings);
router.put('/settings', updateProfileSettings);

export default router;
