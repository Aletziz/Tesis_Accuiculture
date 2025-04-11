import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('MONGODB_URI no definida en las variables de entorno');
      return;
    }

    console.log('Intentando conectar a MongoDB...');
    console.log('URI de MongoDB:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Oculta las credenciales en los logs

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
      socketTimeoutMS: 45000, // Timeout del socket después de 45 segundos
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('MongoDB conectado exitosamente');
    console.log('Estado de la conexión:', mongoose.connection.readyState);
    
    // Configurar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('Error en la conexión de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado');
    });

  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-lanzar el error para manejarlo en el nivel superior
  }
};

export { connectDB }; 