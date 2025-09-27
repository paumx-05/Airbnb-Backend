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
    console.log(`   • Health Check: http://localhost:${config.port}/api/health`);
    console.log(`   • Status: http://localhost:${config.port}/api/status`);
    console.log('='.repeat(60));
    console.log('💡 Presiona Ctrl+C para detener el servidor');
    console.log('='.repeat(60) + '\n');
  });
};

// Iniciar el servidor
startServer();
