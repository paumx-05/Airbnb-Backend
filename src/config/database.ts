import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airbnb-backend';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.warn('⚠️ MongoDB no disponible - continuando sin base de datos');
    console.warn('Para conectar MongoDB, asegúrate de que esté ejecutándose en localhost:27017');
  }
};

export default connectDB;
