import connectDB from '../db.js';

// Función para verificar la conexión a MongoDB
const checkMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      return { status: 'disconnected', message: 'MONGODB_URI no está definida' };
    }
    
    const conn = await connectDB();
    if (conn) {
      return { status: 'connected', message: `Conectado a ${conn.connection.host}` };
    } else {
      return { status: 'disconnected', message: 'No se pudo conectar a MongoDB' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

// Manejador de la ruta de health check
export default async function handler(req, res) {
  try {
    const mongoStatus = await checkMongoDB();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: mongoStatus
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar el estado del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
} 