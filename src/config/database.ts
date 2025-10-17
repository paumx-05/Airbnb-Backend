import mongoose from 'mongoose';

/**
 * 🔧 CONFIGURACIÓN DE BASE DE DATOS
 * Sistema híbrido que permite alternar entre Mock y MongoDB
 */

export const getDatabaseConfig = () => ({
  type: process.env.DB_TYPE || 'mongodb',
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend',
  useMock: process.env.DB_TYPE === 'mock'
});

const connectDB = async (): Promise<void> => {
  const config = getDatabaseConfig();
  
  if (config.type === 'mongodb') {
    try {
      await mongoose.connect(config.mongoURI);
      console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
      console.warn('⚠️ MongoDB no disponible - usando Mock');
      console.warn('Para conectar MongoDB, asegúrate de que esté ejecutándose');
    }
  } else {
    console.log('📦 Usando Mock Database para desarrollo');
  }
};

export default connectDB;
