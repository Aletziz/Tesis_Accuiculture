import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    // Verificar si la URI está definida
    if (!process.env.MONGODB_URI) {
      console.log('MONGODB_URI no está definida, omitiendo conexión a MongoDB');
      return null;
    }

    console.log('Intentando conectar a MongoDB...');

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos
      socketTimeoutMS: 45000,
      family: 4,  // Forzar IPv4
      retryWrites: true,
      w: 'majority'
    };

    // Intentar conectar con reintentos
    let retries = 3;
    while (retries > 0) {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB conectado: ${conn.connection.host}`);
        
        // Manejar eventos de conexión
        mongoose.connection.on('error', err => {
          console.error('Error de conexión MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB desconectado');
        });

        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconectado');
        });

        // Manejar el cierre de la aplicación
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          console.log('Conexión a MongoDB cerrada');
          process.exit(0);
        });

        return conn;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`Intento fallido, reintentando... (${retries} intentos restantes)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de reintentar
      }
    }
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    
    // Proporcionar sugerencias basadas en el error
    if (error.name === 'MongoServerSelectionError') {
      console.log('Sugerencias:');
      console.log('1. Verifica que MongoDB esté instalado y ejecutándose localmente');
      console.log('2. Si estás usando MongoDB Atlas, verifica que la IP esté en la lista blanca');
      console.log('3. Verifica que la URL de conexión sea correcta');
    }
    
    // No cerramos el proceso, solo registramos el error
    console.log('Continuando sin conexión a MongoDB...');
    return null;
  }
};

export default connectDB; 