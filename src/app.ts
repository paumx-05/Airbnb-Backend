/**
 * Configuración simplificada de la aplicación Express
 * Solo incluye la ruta de registro de usuarios
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register } from './controllers/auth/authController';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Crear instancia de la aplicación Express
const app = express();

// =============================================================================
// MIDDLEWARES BÁSICOS (ORDEN IMPORTANTE)
// =============================================================================
// Parsear JSON PRIMERO
app.use(express.json());

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// CORS: Permite peticiones desde diferentes dominios
app.use(cors());

// =============================================================================
// RUTAS SIMPLIFICADAS
// =============================================================================

/**
 * Ruta principal - Información básica
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏠 Airbnb Backend API - Simplificada',
    data: {
      server: 'Airbnb Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        register: 'POST /api/auth/register'
      },
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * Ruta de registro de usuarios - DIRECTA
 */
app.post('/api/auth/register', register);

/**
 * Health Check simple
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
 * Manejo de errores simple
 */
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Error interno del servidor' }
  });
});

/**
 * Manejo de rutas no encontradas
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Ruta no encontrada' }
  });
});

// Exportar la aplicación configurada
export default app;