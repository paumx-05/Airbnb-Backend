import { Router } from 'express';
import { register, login, logout, getProfile } from '../../controllers/auth/authController';
import { authenticateToken, optionalAuth } from '../../middleware/auth/authMiddleware';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', authenticateToken, getProfile);

// Ruta de prueba para verificar middleware
router.get('/test', optionalAuth, (req, res) => {
  const user = (req as any).user;
  
  res.json({
    success: true,
    data: {
      message: user ? `Hola ${user.email}` : 'Hola usuario anónimo',
      authenticated: !!user,
      user: user || null
    }
  });
});

export default router;
