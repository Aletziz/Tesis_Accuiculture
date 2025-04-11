const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const connectDB = require('./db');
const File = require('./models/File');
const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '.')));

// Servir archivos CSS específicamente
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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

        // Primero, intentar obtener el contenido desde MongoDB
        let fileDoc = await File.findOne({ path: filePath });
        
        if (fileDoc) {
            // Si existe en MongoDB, devolver ese contenido
            res.send(fileDoc.content);
        } else {
            // Si no existe en MongoDB, leer del sistema de archivos
            const content = await fs.readFile(filePath, 'utf8');
            res.send(content);
        }
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

        // Guardar en MongoDB en lugar de en el sistema de archivos
        await File.findOneAndUpdate(
            { path: filePath },
            { 
                content: content,
                lastModified: Date.now()
            },
            { upsert: true, new: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error al guardar archivo:', error);
        res.status(500).json({ error: 'Error al guardar archivo' });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor solo si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

// Exportar la app para Vercel
module.exports = app;
