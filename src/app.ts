import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { register } from './controllers/auth/authController';
import authRoutes from './routes/auth/authRoutes';
import notificationRoutes from './routes/notifications/notificationRoutes';
import profileRoutes from './routes/profile/profileRoutes';
import searchRoutes from './routes/search/searchRoutes';
import propertyRoutes from './routes/properties/propertyRoutes';
import statsRoutes from './routes/stats/statsRoutes';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';
import { generalRateLimit } from './middleware/rateLimiter';

dotenv.config();
const app = express();

// =============================================================================
// MIDDLEWARES BÁSICOS (ORDEN IMPORTANTE)
// =============================================================================
// Middleware de seguridad
app.use(helmet());

// CORS: Permite peticiones desde diferentes dominios
app.use(cors());

// Middleware de logging
app.use(morgan('combined'));

// Rate limiting general
app.use(generalRateLimit);

// Parsear JSON PRIMERO
app.use(express.json({ limit: '10mb' }));

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// RUTAS PRINCIPALES
// =============================================================================

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏠 Airbnb Backend API - Sistema Completo',
    data: {
      server: 'Airbnb Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/me'
        },
        notifications: {
          list: 'GET /api/notifications',
          markRead: 'PATCH /api/notifications/:id/read',
          markAllRead: 'PATCH /api/notifications/mark-all-read',
          delete: 'DELETE /api/notifications/:id',
          clearAll: 'DELETE /api/notifications/clear-all',
          test: 'POST /api/notifications/test',
          settings: 'GET /api/notifications/settings',
          updateSettings: 'PUT /api/notifications/settings'
        },
        profile: {
          update: 'PUT /api/profile',
          changePassword: 'POST /api/profile/change-password',
          settings: 'GET /api/profile/settings',
          updateSettings: 'PUT /api/profile/settings'
        },
        search: {
          properties: 'GET /api/search/properties',
          suggestions: 'GET /api/search/suggestions',
          filters: 'GET /api/search/filters'
        },
        properties: {
          get: 'GET /api/properties/:id',
          popular: 'GET /api/properties/popular'
        },
        stats: {
          system: 'GET /api/stats',
          logs: 'GET /api/stats/logs',
          clearLogs: 'POST /api/stats/logs/clear'
        }
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de notificaciones
app.use('/api/notifications', notificationRoutes);

// Rutas de perfil
app.use('/api/profile', profileRoutes);

// Rutas de búsqueda
app.use('/api/search', searchRoutes);

// Rutas de propiedades
app.use('/api/properties', propertyRoutes);

// Rutas de estadísticas
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString()
    }
  });
});

// =============================================================================
// MANEJO DE ERRORES
// =============================================================================
// Middleware de manejo de errores
app.use(errorHandler);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Ruta no encontrada' }
  });
});

export default app;