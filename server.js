import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db.js';
import File from './models/File.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));

// Configuración de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Servir archivos estáticos
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, '.')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Conectar a MongoDB solo si es necesario
if (process.env.MONGODB_URI) {
  connectDB().catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });
}

// Ruta para verificar el estado del servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 });
});

// Ruta para obtener la lista de archivos
app.get('/api/files', async (req, res) => {
    try {
        const files = await fs.readdir('.');
        res.json(files);
    } catch (error) {
        console.error('Error al leer directorio:', error);
        res.status(500).json({ error: 'Error al leer directorio' });
    }
});

// Ruta para obtener el contenido de un archivo
app.get('/api/file-content', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) {
            return res.status(400).json({ error: 'Ruta de archivo no proporcionada' });
        }

        // Si MongoDB está conectado, intentar obtener el contenido desde ahí
        if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
            let fileDoc = await File.findOne({ path: filePath });
            if (fileDoc) {
                return res.send(fileDoc.content);
            }
        }

        // Si no está en MongoDB o no hay conexión, leer del sistema de archivos
        const content = await fs.readFile(filePath, 'utf8');
        res.send(content);
    } catch (error) {
        console.error('Error al leer archivo:', error);
        res.status(500).json({ error: 'Error al leer archivo' });
    }
});

// Ruta para guardar cambios en un archivo
app.post('/api/save-file', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        if (!filePath || !content) {
            return res.status(400).json({ error: 'Ruta de archivo o contenido no proporcionado' });
        }

        // Si MongoDB está conectado, guardar ahí
        if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
            await File.findOneAndUpdate(
                { path: filePath },
                { 
                    content: content,
                    lastModified: Date.now()
                },
                { upsert: true, new: true }
            );
        }

        // También guardar en el sistema de archivos
        await fs.writeFile(filePath, content, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Error al guardar archivo:', error);
        res.status(500).json({ error: 'Error al guardar archivo' });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

export default app;
