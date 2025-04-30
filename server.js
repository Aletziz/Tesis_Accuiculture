import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import connectDB from './db.js';
import dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON con un límite de 50mb
app.use(express.json({ limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(join(__dirname, '.')));

// Servir archivos CSS específicamente
app.use('/css', express.static(join(__dirname, 'css')));

// Servir archivos JS específicamente
app.use('/js', express.static(join(__dirname, 'js')));

// Variable para almacenar el estado de la conexión a MongoDB
let isMongoDBConnected = false;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Intentar conectar a MongoDB
    console.log('Intentando conectar a MongoDB...');
    isMongoDBConnected = await connectDB();
    
    if (!isMongoDBConnected) {
      console.warn('El servidor iniciará sin conexión a MongoDB. Algunas funcionalidades pueden no estar disponibles.');
      console.warn('Para habilitar todas las funcionalidades, asegúrate de configurar correctamente la variable MONGODB_URI en tu archivo .env');
      console.warn('Si estás usando MongoDB Atlas, verifica que tu dirección IP esté en la lista blanca:');
      console.warn('1. Inicia sesión en MongoDB Atlas (https://cloud.mongodb.com)');
      console.warn('2. Ve a "Network Access" en el menú lateral');
      console.warn('3. Haz clic en "Add IP Address" y añade tu dirección IP actual');
    } else {
      console.log('Conexión a MongoDB establecida correctamente.');
    }

    // Ruta de health check
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        mongodb: isMongoDBConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Ruta principal
    app.get('/', (req, res) => {
      res.sendFile(join(__dirname, 'index.html'));
    });

    // Ruta para listar archivos
    app.get('/api/files', async (req, res) => {
      try {
        const files = await fs.readdir(__dirname);
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        res.json(htmlFiles);
      } catch (error) {
        console.error('Error al listar archivos:', error);
        res.status(500).json({ error: 'Error al listar archivos' });
      }
    });

    // Ruta para obtener el contenido de un archivo
    app.get('/api/files/:filename', async (req, res) => {
      try {
        const { filename } = req.params;
        const filePath = join(__dirname, filename);
        const content = await fs.readFile(filePath, 'utf8');
        res.json({ content });
      } catch (error) {
        console.error('Error al leer archivo:', error);
        res.status(500).json({ error: 'Error al leer archivo' });
      }
    });

    // Ruta para guardar cambios en un archivo
    app.post('/api/files/:filename', async (req, res) => {
      try {
        const { filename } = req.params;
        const { content } = req.body;
        const filePath = join(__dirname, filename);
        await fs.writeFile(filePath, content, 'utf8');
        res.json({ message: 'Archivo guardado exitosamente' });
      } catch (error) {
        console.error('Error al guardar archivo:', error);
        res.status(500).json({ error: 'Error al guardar archivo' });
      }
    });

    // Middleware de manejo de errores
    app.use((err, req, res, next) => {
      console.error('Error en el servidor:', err);
      res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
          ? 'Error interno del servidor' 
          : err.message
      });
    });

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log('Estado de MongoDB:', isMongoDBConnected ? 'Conectado' : 'Desconectado');
      console.log('Modo:', process.env.NODE_ENV || 'development');
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
