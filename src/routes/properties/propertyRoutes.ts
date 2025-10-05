import { Router } from 'express';
import { getProperty, getPopularProperties } from '../../controllers/properties/propertyController';

const router = Router();

// Rutas públicas de propiedades
router.get('/:id', getProperty);
router.get('/popular', getPopularProperties);

export default router;
