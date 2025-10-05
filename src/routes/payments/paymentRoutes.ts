import { Router } from 'express';
import { 
  calculateCheckout,
  processCheckout,
  getPaymentMethods,
  getTransactions,
  getTransaction,
  refundTransaction
} from '../../controllers/payments/paymentController';
import { authenticateToken } from '../../middleware/auth/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de checkout
router.post('/checkout/calculate', calculateCheckout);
router.post('/checkout/process', processCheckout);

// Rutas de métodos de pago
router.get('/methods', getPaymentMethods);

// Rutas de transacciones
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransaction);
router.post('/transactions/:id/refund', refundTransaction);

export default router;
