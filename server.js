import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import File from './models/File.js';
import { connectDB } from './db.js';

// Configurar dotenv
dotenv.config();

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON con límite de 50mb
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Servir archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname, '.')));

// Servir archivos CSS desde el directorio css
app.use('/css', express.static(path.join(__dirname, 'css')));

// Servir archivos JS desde el directorio js
app.use('/js', express.static(path.join(__dirname, 'js')));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para listar archivos
app.get('/api/files', async (req, res) => {
  try {
    console.log('Listando archivos...');
    const files = await fs.promises.readdir(__dirname);
    console.log('Archivos encontrados:', files);
    res.json(files);
  } catch (err) {
    console.error('Error al leer el directorio:', err);
    res.status(500).json({ error: 'Error al leer el directorio' });
  }
});

// Ruta para obtener el contenido de un archivo
app.get('/api/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('Intentando leer archivo:', filename);
    
    const filePath = path.join(__dirname, filename);
    console.log('Ruta completa del archivo:', filePath);
    
    const content = await fs.promises.readFile(filePath, 'utf8');
    console.log('Contenido del archivo leído correctamente');
    
    res.json({ content });
  } catch (err) {
    console.error('Error al leer el archivo:', err);
    res.status(500).json({ 
      error: 'Error al leer el archivo',
      message: err.message,
      path: req.params.filename
    });
  }
});

// Ruta para guardar cambios en un archivo
app.post('/api/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const content = req.body.content;
    
    console.log('Intentando guardar archivo:', filename);
    console.log('Contenido a guardar:', content ? 'Contenido presente' : 'Sin contenido');
    
    const filePath = path.join(__dirname, filename);
    console.log('Ruta completa del archivo:', filePath);
    
    await fs.promises.writeFile(filePath, content, 'utf8');
    console.log('Archivo guardado correctamente');
    
    res.json({ 
      message: 'Archivo guardado correctamente',
      filename: filename
    });
  } catch (err) {
    console.error('Error al guardar el archivo:', err);
    res.status(500).json({ 
      error: 'Error al guardar el archivo',
      message: err.message,
      path: req.params.filename
    });
  }
});

// Ruta de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Intentar conectar a MongoDB si la URI está definida
    if (process.env.MONGODB_URI) {
      console.log('Iniciando conexión a MongoDB...');
      await connectDB();
    } else {
      console.log('MONGODB_URI no definida, omitiendo conexión a MongoDB');
    }

    // Iniciar el servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log('MongoDB connection state:', mongoose.connection.readyState === 1 ? 'connected' : 'disconnected');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

export default app;
