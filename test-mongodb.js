import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para probar la conexión a MongoDB
const testMongoDBConnection = async () => {
  try {
    console.log('Iniciando prueba de conexión a MongoDB...');
    
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('Error: MONGODB_URI no está definida en las variables de entorno');
      return;
    }
    
    // Verificar si la URI contiene un placeholder de contraseña
    if (MONGODB_URI.includes('<db_password>')) {
      console.error('Error: La URI de MongoDB contiene un placeholder de contraseña.');
      console.error('Por favor, reemplaza <db_password> en tu archivo .env con tu contraseña real de MongoDB Atlas.');
      return;
    }
    
    // Ocultar la contraseña en los logs
    const maskedURI = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
    console.log('URI de MongoDB (oculta):', maskedURI);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    };
    
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('¡Conexión exitosa a MongoDB!');
    console.log('Estado de la conexión:', mongoose.connection.readyState);
    
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Detalles del error de selección de servidor:', {
        reason: error.reason,
        code: error.code
      });
    } else if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('Error de autenticación: Las credenciales proporcionadas no son correctas.');
      console.error('Por favor, verifica tu nombre de usuario y contraseña en la URI de MongoDB.');
    }
  }
};

// Ejecutar la prueba
testMongoDBConnection(); 