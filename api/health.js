// Función serverless simplificada para health check
export default function handler(req, res) {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb_uri: process.env.MONGODB_URI ? 'configurada' : 'no configurada'
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar el estado del servidor'
    });
  }
} 