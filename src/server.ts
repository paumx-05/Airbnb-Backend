/**
 * Punto de entrada del servidor
 * Este archivo inicia el servidor Express y maneja la configuración del puerto
 */

import app from './app';
import { config } from './config/environment';
import logger from './utils/logger';

/**
 * Función para iniciar el servidor Express
 * Configura el puerto y muestra información de inicio
 */
const startServer = (): void => {
  app.listen(config.port, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 AIRBNB BACKEND SERVER INICIADO');
    console.log('='.repeat(60));
    console.log(`📊 Entorno: ${config.nodeEnv}`);
    console.log(`🔗 URL Local: http://localhost:${config.port}`);
    console.log(`🔗 URL Network: http://0.0.0.0:${config.port}`);
    console.log(`📡 Puerto: ${config.port}`);
    console.log('='.repeat(60));
    console.log('📋 Endpoints disponibles:');
    console.log('='.repeat(60));
    console.log('🔐 AUTENTICACIÓN:');
    console.log(`   • POST /api/auth/register          - Registrar usuario`);
    console.log(`   • POST /api/auth/login             - Iniciar sesión`);
    console.log(`   • POST /api/auth/logout            - Cerrar sesión`);
    console.log(`   • GET  /api/auth/me                - Perfil del usuario (🔒)`);
    console.log(`   • POST /api/auth/forgot-password   - Recuperar contraseña`);
    console.log(`   • POST /api/auth/reset-password    - Restablecer contraseña`);
    console.log(`   • GET  /api/auth/test              - Prueba de middleware`);
    console.log('');
    console.log('👥 USUARIOS (CRUD):');
    console.log(`   • GET    /api/users                - Listar usuarios (🔒)`);
    console.log(`   • POST   /api/users                - Crear usuario (🔒)`);
    console.log(`   • GET    /api/users/:id            - Obtener usuario (🔒)`);
    console.log(`   • PUT    /api/users/:id            - Actualizar usuario (🔒)`);
    console.log(`   • PATCH  /api/users/:id            - Actualizar parcial (🔒)`);
    console.log(`   • DELETE /api/users/:id            - Eliminar usuario (🔒)`);
    console.log(`   • GET    /api/users/stats          - Estadísticas (🔒)`);
    console.log('');
    console.log('📊 SISTEMA Y MONITOREO:');
    console.log(`   • GET    /api/health               - Health check`);
    console.log(`   • GET    /api/status               - Estado del servidor`);
    console.log(`   • GET    /api/docs                 - Documentación API (🔒)`);
    console.log(`   • GET    /api/stats                - Estadísticas del sistema (🔒)`);
    console.log(`   • GET    /api/stats/logs           - Ver logs (🔒)`);
    console.log(`   • POST   /api/stats/logs/clear     - Limpiar logs (🔒)`);
    console.log('');
    console.log('🌐 PÚBLICAS:');
    console.log(`   • GET    /                         - Información de la API`);
    console.log('='.repeat(60));
    console.log('🔒 = Requiere autenticación (Bearer token)');
    console.log('='.repeat(60));
    console.log('💡 Presiona Ctrl+C para detener el servidor');
    console.log('='.repeat(60) + '\n');
  });
};

// Iniciar el servidor
startServer();
