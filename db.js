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
      console.error('Ejemplo: MONGODB_URI=mongodb+srv://usuario:contraseña_real@cluster.mongodb.net/database');
      return false;
    }

    // Ocultar la contraseña en los logs
    const maskedURI = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@');
    console.log('URI de MongoDB (oculta):', maskedURI);

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Aumentado a 30 segundos
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Aumentado a 30 segundos
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      // Añadir opciones específicas para replica sets
      replicaSet: 'atlas-3i59kx-shard-0',
      readPreference: 'primaryPreferred',
      // Añadir opciones de SSL
      ssl: true,
      tlsAllowInvalidCertificates: true
    };

    console.log('Intentando conectar a MongoDB con las siguientes opciones:');
    console.log('- Timeout de selección de servidor: 30 segundos');
    console.log('- Timeout de conexión: 30 segundos');
    console.log('- Replica set: atlas-3i59kx-shard-0');
    console.log('- Read preference: primaryPreferred');
    console.log('- SSL: habilitado');

    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB conectado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    
    // Manejar errores específicos
    if (error.name === 'MongooseServerSelectionError') {
      console.error('Detalles del error de selección de servidor:', {
        reason: error.reason,
        code: error.code
      });
      
      // Sugerencias adicionales para resolver el problema
      console.error('\nSugerencias para resolver el problema:');
      console.error('1. Verifica que el clúster de MongoDB Atlas esté activo y funcionando');
      console.error('2. Asegúrate de que la URI de conexión sea correcta');
      console.error('3. Verifica que el nombre de usuario y la contraseña sean correctos');
      console.error('4. Comprueba que el nombre del clúster en la URI coincida con el clúster real');
      console.error('5. Intenta conectarte desde otra red (por ejemplo, usando datos móviles)');
    } else if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('Error de autenticación: Las credenciales proporcionadas no son correctas.');
      console.error('Por favor, verifica tu nombre de usuario y contraseña en la URI de MongoDB.');
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
  } catch (err) {
    console.error('Error al cerrar la conexión:', err);
    process.exit(1);
  }
});

export default connectDB; 