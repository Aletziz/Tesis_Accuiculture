import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI no está definida en las variables de entorno');
      return false;
    }

    // Verificar si la URI contiene un placeholder de contraseña
    if (MONGODB_URI.includes('<db_password>')) {
      console.error('Error: La URI de MongoDB contiene un placeholder de contraseña.');
      console.error('Por favor, reemplaza <db_password> en tu archivo .env con tu contraseña real de MongoDB Atlas.');
      return false;
    }

    // Ocultar la contraseña en los logs
    const maskedURI = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
    console.log('URI de MongoDB (oculta):', maskedURI);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reducido a 5 segundos para fallar más rápido
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Reducido a 10 segundos
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5
    };

    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB conectado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    
    // Manejar errores específicos
    if (error.name === 'MongooseServerSelectionError') {
      console.error('\nSugerencias para resolver el problema:');
      console.error('1. Verifica tu conexión a internet');
      console.error('2. Asegúrate de que el clúster de MongoDB Atlas esté activo');
      console.error('3. Verifica que la URI de conexión sea correcta');
      console.error('4. Intenta usar el comando ping para verificar la conectividad:');
      console.error('   ping tesis.bhhr20s.mongodb.net');
      console.error('5. Verifica que no haya un firewall bloqueando la conexión');
    }
    
    return false;
  }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado de MongoDB');
});

// Manejar el cierre de la aplicación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada por terminación de la aplicación');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

export default connectDB; 