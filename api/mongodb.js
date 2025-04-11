import mongoose from 'mongoose';

// Función para conectar a MongoDB
const connectDB = async () => {
  try {
    // Verificar si la URI está definida
    if (!process.env.MONGODB_URI) {
      return { status: 'error', message: 'MONGODB_URI no está definida' };
    }

    console.log('Intentando conectar a MongoDB...');

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos
      socketTimeoutMS: 45000,
      family: 4  // Forzar IPv4
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    return { 
      status: 'success', 
      message: `Conectado a ${conn.connection.host}`,
      host: conn.connection.host
    };
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    return { 
      status: 'error', 
      message: error.message,
      name: error.name
    };
  }
};

// Manejador para probar la conexión a MongoDB
export default async function handler(req, res) {
  try {
    const result = await connectDB();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: result
    });
  } catch (error) {
    console.error('Error en la prueba de MongoDB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al probar la conexión a MongoDB',
      error: error.message
    });
  }
} 