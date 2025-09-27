/**
 * Configuración principal de la aplicación Express
 * Este archivo configura todos los middlewares, rutas y configuraciones de la API
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';
import authRoutes from './routes/auth/authRoutes';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear instancia de la aplicación Express
const app = express();

// =============================================================================
// CONFIGURACIÓN DE BASE DE DATOS
// =============================================================================
// Nota: La conexión a MongoDB está comentada temporalmente
// Para habilitar: descomenta la línea siguiente y configura MONGODB_URI en .env
// connectDB();

// =============================================================================
// MIDDLEWARES DE SEGURIDAD
// =============================================================================
// Helmet: Protege contra vulnerabilidades comunes (XSS, clickjacking, etc.)
app.use(helmet());

// CORS: Permite peticiones desde diferentes dominios
app.use(cors());

// =============================================================================
// MIDDLEWARES DE LOGGING Y PARSING
// =============================================================================
// Morgan: Registra todas las peticiones HTTP
app.use(morgan('combined'));

// Parsear JSON con límite de 10MB para archivos grandes
app.use(express.json({ limit: '10mb' }));

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// RUTAS DE LA APLICACIÓN
// =============================================================================

/**
 * Ruta principal de la API
 * Proporciona información básica sobre la API y endpoints disponibles
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏠 Bienvenido a Airbnb Backend API',
    data: {
      server: 'Airbnb Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/api/health',
        status: '/api/status',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/me'
        }
      },
      documentation: 'Consulta la documentación para más información sobre los endpoints disponibles',
      timestamp: new Date().toISOString()
    }
  });
});

// Rutas de autenticación (registro, login, logout, perfil)
app.use('/api/auth', authRoutes);

// =============================================================================
// RUTAS DE UTILIDAD Y MONITOREO
// =============================================================================

/**
 * Health Check - Verifica que el servidor esté funcionando
 * Útil para monitoreo y load balancers
 */
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

/**
 * Status - Información detallada del servidor
 * Incluye uptime, versión y configuración del entorno
 */
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      server: 'Airbnb Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// =============================================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// =============================================================================
// IMPORTANTE: Debe ir al final, después de todas las rutas
// Captura errores no manejados y los formatea apropiadamente
app.use(errorHandler);

// Exportar la aplicación configurada
export default app;