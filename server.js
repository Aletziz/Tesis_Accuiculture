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

// Conectar a MongoDB si la URI está definida
if (process.env.MONGODB_URI) {
  connectDB();
}

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
app.get('/api/files', (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error('Error al leer el directorio:', err);
      return res.status(500).json({ error: 'Error al leer el directorio' });
    }
    res.json(files);
  });
});

// Ruta para obtener el contenido de un archivo
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, req.params.filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    res.json({ content: data });
  });
});

// Ruta para guardar cambios en un archivo
app.post('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, req.params.filename);
  const content = req.body.content;

  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      console.error('Error al guardar el archivo:', err);
      return res.status(500).json({ error: 'Error al guardar el archivo' });
    }
    res.json({ message: 'Archivo guardado correctamente' });
  });
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
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar el servidor solo si no estamos en producción
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
